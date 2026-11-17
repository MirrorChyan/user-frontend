"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CLIENT_BACKEND } from "@/app/requests/misc";
import styles from "@/components/design-a/flow.module.css";
import { parseSupportOptions, resolveDownloadPlatform } from "@/lib/utils/support";
import {
  requestAttributionCheck,
  submitAttributionChecks,
  type AttributionTarget,
} from "@/lib/batch-attribution";

interface Props {
  cdks: string[];
  expiredAt?: string;
}

interface Project {
  resource: string;
  name: string;
  support: string[];
}

type CardStatus = { state: "pending" | "sending" | "submitted" | "failed"; code?: number };
type CheckState = {
  state: "idle" | "checking" | "ready" | "failed";
  version?: string;
  code?: number;
  target?: AttributionTarget;
};

const isProject = (value: unknown): value is Project => {
  if (!value || typeof value !== "object") return false;
  const project = value as Project;
  return (
    typeof project.resource === "string" &&
    typeof project.name === "string" &&
    Array.isArray(project.support) &&
    project.support.every(item => typeof item === "string")
  );
};

export default function BatchAttribution(props: Props) {
  // Changing orders cancels the previous session and discards its selections and results.
  return <AttributionSession key={props.cdks.join("\u0000")} {...props} />;
}

function AttributionSession({ cdks, expiredAt }: Props) {
  const t = useTranslations("BatchAttribution");
  const id = useId();
  const cards = useMemo(() => [...new Set(cdks.filter(Boolean))], [cdks]);
  const [enabled, setEnabled] = useState(false);
  const [manual, setManual] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [catalogueState, setCatalogueState] = useState<"loading" | "ready" | "failed">("loading");
  const [catalogueAttempt, setCatalogueAttempt] = useState(0);
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("");
  const [supportIndex, setSupportIndex] = useState("");
  const [manualTarget, setManualTarget] = useState<AttributionTarget>({
    rid: "",
    os: "",
    arch: "",
    channel: "stable",
  });
  const [check, setCheck] = useState<CheckState>({ state: "idle" });
  const [confirmed, setConfirmed] = useState(false);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [statuses, setStatuses] = useState<CardStatus[]>([]);
  const [now, setNow] = useState(Date.now);
  const requestController = useRef<AbortController | null>(null);
  const runningRef = useRef(false);
  const expiryTime = expiredAt ? new Date(expiredAt).getTime() : NaN;
  const expired = Number.isFinite(expiryTime) && now >= expiryTime;

  useEffect(() => () => requestController.current?.abort(), []);

  useEffect(() => {
    if (!Number.isFinite(expiryTime)) return;
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [expiryTime]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetch(`${CLIENT_BACKEND}/api/misc/project`, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]),
    })
      .then(async response => {
        if (!response.ok) throw new Error("catalogue");
        const payload = await response.json();
        if (payload.ec !== 200 || !Array.isArray(payload.data)) throw new Error("catalogue");
        if (!controller.signal.aborted) {
          setProjects(payload.data.filter(isProject));
          setCatalogueState("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setCatalogueState("failed");
      });
    return () => controller.abort();
  }, [enabled, catalogueAttempt]);

  const project = projects.find(item => item.resource === projectId);
  const supportOptions = useMemo(
    () =>
      parseSupportOptions(project?.support ?? []).filter(
        option => option.channel && option.pkgOs && option.pkgArch
      ),
    [project]
  );
  const support = supportIndex === "" ? undefined : supportOptions[Number(supportIndex)];
  const target: AttributionTarget | null = manual
    ? { ...manualTarget, rid: manualTarget.rid.trim() }
    : project && support
      ? {
          rid: support.rid || project.resource,
          channel: support.channel,
          ...resolveDownloadPlatform(support, support.os, support.arch),
        }
      : null;
  const validTarget = !!target?.rid && !/[\s/\\?#]/.test(target.rid) && target.rid.length <= 128;
  const checkedTarget = check.target;
  const isCheckedTarget =
    check.state === "ready" &&
    target &&
    checkedTarget &&
    target.rid === checkedTarget.rid &&
    target.os === checkedTarget.os &&
    target.arch === checkedTarget.arch &&
    target.channel === checkedTarget.channel;
  const locked = running || started || expired;
  const filteredProjects = projects.filter(item =>
    `${item.name} ${item.resource}`.toLowerCase().includes(search.trim().toLowerCase())
  );
  const submitted = statuses.filter(item => item.state === "submitted").length;
  const failed = statuses.filter(item => item.state === "failed").length;
  const finished = submitted + failed;

  const resetCheck = () => {
    requestController.current?.abort();
    setCheck({ state: "idle" });
    setConfirmed(false);
  };

  const errorText = (code?: number) => {
    if (code === 8001) return t("noRelease");
    if (code === 7001) return t("expired");
    if (code === 7002) return t("invalidCdk");
    if (code === 7003) return t("quota");
    if (code === 7004) return t("mismatch");
    if (code === 7005) return t("blocked");
    if (code === 1001 || code === 8002 || code === 8003 || code === 8004) return t("invalidParams");
    return typeof code === "number" ? t("requestFailedCode", { code }) : t("requestFailed");
  };

  const checkProject = async () => {
    if (!target || !validTarget || locked) return;
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setCheck({ state: "checking" });
    setConfirmed(false);
    const result = await requestAttributionCheck(CLIENT_BACKEND, target, controller.signal);
    if (controller.signal.aborted) return;
    setCheck(
      result.ok
        ? {
            state: "ready",
            version: result.version,
            target: { ...target, currentVersion: result.version },
          }
        : { state: "failed", code: result.code }
    );
  };

  const submit = async (retry: boolean) => {
    if (Number.isFinite(expiryTime) && Date.now() >= expiryTime) {
      setNow(Date.now());
      return;
    }
    if (!checkedTarget || !isCheckedTarget || !confirmed || runningRef.current) {
      return;
    }
    const positions = retry
      ? statuses.flatMap((item, index) => (item.state === "failed" ? [index] : []))
      : cards.map((_, index) => index);
    if (positions.length === 0 || (!retry && started)) return;
    runningRef.current = true;
    setRunning(true);
    setStarted(true);
    if (!retry) {
      setStatuses(cards.map(() => ({ state: "pending" })));
    } else {
      const retryPositions = new Set(positions);
      setStatuses(previous =>
        previous.map((item, index) => (retryPositions.has(index) ? { state: "pending" } : item))
      );
    }
    const controller = new AbortController();
    requestController.current = controller;
    const updateStatus = (position: number, status: CardStatus) => {
      setStatuses(previous => previous.map((item, index) => (index === position ? status : item)));
    };
    await submitAttributionChecks(
      positions,
      position =>
        Number.isFinite(expiryTime) && Date.now() >= expiryTime
          ? Promise.resolve({ ok: false, code: 7001 })
          : requestAttributionCheck(
              CLIENT_BACKEND,
              checkedTarget,
              controller.signal,
              cards[position]
            ),
      position => updateStatus(position, { state: "sending" }),
      (position, result) =>
        updateStatus(
          position,
          result.ok ? { state: "submitted" } : { state: "failed", code: result.code }
        ),
      controller.signal
    );
    runningRef.current = false;
    if (!controller.signal.aborted) setRunning(false);
  };

  if (cards.length === 0) return null;

  return (
    <section className={`${styles.card} p-5 sm:p-6`} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-base font-semibold">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--a-muted)]">{t("description")}</p>
      {expired && (
        <p role="status" className="mt-3 text-sm leading-6 text-[var(--a-muted)]">
          {t("batchExpired")}
        </p>
      )}
      <fieldset className="mt-4 space-y-3" disabled={locked}>
        <legend className="sr-only">{t("title")}</legend>
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="radio"
            name={`${id}-mode`}
            checked={!enabled}
            className="mt-1 accent-[var(--a-accent)]"
            onChange={() => {
              resetCheck();
              setEnabled(false);
            }}
          />
          <span>{t("defaultOption")}</span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="radio"
            name={`${id}-mode`}
            checked={enabled}
            className="mt-1 accent-[var(--a-accent)]"
            onChange={() => setEnabled(true)}
          />
          <span>{t("specifyOption")}</span>
        </label>
      </fieldset>

      {enabled && (
        <div className="mt-5 space-y-4">
          <fieldset disabled={locked} className="space-y-4 disabled:opacity-70">
            <legend className="sr-only">{t("project")}</legend>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={manual}
                className="accent-[var(--a-accent)]"
                onChange={event => {
                  resetCheck();
                  setManual(event.target.checked);
                }}
              />
              {t("manualOption")}
            </label>
            {manual ? (
              <>
                <label className="block text-sm">
                  <span className={styles.label}>{t("rid")}</span>
                  <input
                    className={styles.input}
                    value={manualTarget.rid}
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={128}
                    placeholder={t("ridPlaceholder")}
                    onChange={event => {
                      resetCheck();
                      setManualTarget(previous => ({ ...previous, rid: event.target.value }));
                    }}
                  />
                </label>
                <details className="rounded-lg border border-[var(--a-border)] p-3">
                  <summary className="cursor-pointer text-sm text-[var(--a-muted)]">
                    {t("advancedOptions")}
                  </summary>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {(["os", "arch", "channel"] as const).map(field => (
                      <label key={field} className="block text-sm">
                        <span className={styles.label}>{t(field)}</span>
                        <select
                          className={styles.input}
                          value={manualTarget[field]}
                          onChange={event => {
                            resetCheck();
                            setManualTarget(previous => ({
                              ...previous,
                              [field]: event.target.value,
                            }));
                          }}
                        >
                          {(field === "os"
                            ? ["", "windows", "linux", "darwin", "android"]
                            : field === "arch"
                              ? ["", "amd64", "arm64", "386", "arm"]
                              : ["stable", "beta", "alpha"]
                          ).map(value => (
                            <option key={value} value={value}>
                              {value || t("unspecified")}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--a-muted)]">{t("manualHint")}</p>
                </details>
              </>
            ) : (
              <>
                {catalogueState === "loading" && (
                  <p role="status" className="text-sm text-[var(--a-muted)]">
                    {t("loadingProjects")}
                  </p>
                )}
                {catalogueState === "failed" && (
                  <div className="space-y-2 text-sm">
                    <p role="alert">{t("catalogueFailed")}</p>
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() => {
                        setCatalogueState("loading");
                        setCatalogueAttempt(previous => previous + 1);
                      }}
                    >
                      {t("reloadProjects")}
                    </button>
                  </div>
                )}
                {catalogueState === "ready" && (
                  <>
                    <label className="block text-sm">
                      <span className={styles.label}>{t("search")}</span>
                      <input
                        className={styles.input}
                        value={search}
                        placeholder={t("searchPlaceholder")}
                        onChange={event => setSearch(event.target.value)}
                      />
                    </label>
                    <label className="block text-sm">
                      <span className={styles.label}>{t("project")}</span>
                      <select
                        className={styles.input}
                        value={projectId}
                        onChange={event => {
                          resetCheck();
                          const resource = event.target.value;
                          setProjectId(resource);
                          const selectedProject = projects.find(item => item.resource === resource);
                          const options = parseSupportOptions(
                            selectedProject?.support ?? []
                          ).filter(option => option.channel && option.pkgOs && option.pkgArch);
                          const matchesResource = (option: (typeof options)[number]) =>
                            !option.rid || option.rid === resource;
                          const stableIndex = options.findIndex(
                            option => matchesResource(option) && option.channel === "stable"
                          );
                          const index =
                            stableIndex >= 0 ? stableIndex : options.findIndex(matchesResource);
                          // A different RID always requires an explicit choice in advanced options.
                          setSupportIndex(index >= 0 ? String(index) : "");
                        }}
                      >
                        <option value="">{t("chooseProject")}</option>
                        {project && !filteredProjects.some(item => item.resource === projectId) && (
                          <option value={project.resource}>
                            {project.name} · {project.resource}
                          </option>
                        )}
                        {filteredProjects.map(item => (
                          <option key={item.resource} value={item.resource}>
                            {item.name} · {item.resource}
                          </option>
                        ))}
                      </select>
                    </label>
                    {filteredProjects.length === 0 && (
                      <p className="text-sm text-[var(--a-muted)]">{t("noProjects")}</p>
                    )}
                    {project && (
                      <details
                        key={project.resource}
                        open={!support}
                        className="rounded-lg border border-[var(--a-border)] p-3"
                      >
                        <summary className="cursor-pointer text-sm text-[var(--a-muted)]">
                          {t("advancedOptions")}
                        </summary>
                        <label className="mt-4 block text-sm">
                          <span className={styles.label}>{t("releaseOption")}</span>
                          <select
                            className={styles.input}
                            value={supportIndex}
                            onChange={event => {
                              resetCheck();
                              setSupportIndex(event.target.value);
                            }}
                          >
                            <option value="">{t("chooseRelease")}</option>
                            {supportOptions.map((option, index) => (
                              <option key={index} value={String(index)}>
                                {option.rid || project.resource} · {option.channel} · {option.pkgOs}{" "}
                                / {option.pkgArch}
                              </option>
                            ))}
                          </select>
                        </label>
                      </details>
                    )}
                    {project && supportOptions.length === 0 && (
                      <p className="text-sm text-[var(--a-muted)]">{t("noReleaseOptions")}</p>
                    )}
                  </>
                )}
              </>
            )}
            {!manual && project && target && target.rid !== project.resource && (
              <p className="text-sm leading-6 text-[var(--a-muted)]">
                {t("overrideHint", { projectRid: project.resource, targetRid: target.rid })}
              </p>
            )}
            <button
              type="button"
              className={`${styles.secondary} w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto`}
              disabled={!validTarget || check.state === "checking"}
              onClick={checkProject}
            >
              {check.state === "checking" ? t("checking") : t("checkProject")}
            </button>
          </fieldset>

          {check.state === "failed" && (
            <p role="alert" className="text-sm leading-6 text-red-600 dark:text-red-400">
              {errorText(check.code)}
            </p>
          )}
          {isCheckedTarget && checkedTarget && (
            <div className="space-y-3 rounded-lg bg-[var(--a-soft)] p-4 text-sm leading-6">
              <p className="font-medium break-all">{t("target", { rid: checkedTarget.rid })}</p>
              {!started && (
                <p className="text-[var(--a-muted)]">
                  {t("checked", { version: check.version ?? "" })}
                </p>
              )}
              <p className="text-[var(--a-muted)]">{t("firstCheckInRule")}</p>
              <p className="text-[var(--a-muted)]">{t("effectNote")}</p>
              {!started && (
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    disabled={expired}
                    className="mt-1.5 accent-[var(--a-accent)]"
                    onChange={event => setConfirmed(event.target.checked)}
                  />
                  <span>{t("confirm", { count: cards.length, rid: checkedTarget.rid })}</span>
                </label>
              )}
            </div>
          )}
          {!started && (
            <button
              type="button"
              className={`${styles.primary} w-full sm:w-auto`}
              disabled={expired || !confirmed || !isCheckedTarget}
              onClick={() => submit(false)}
            >
              {t("submit")}
            </button>
          )}

          {started && (
            <div className="space-y-3">
              <p role="status" aria-live="polite" className="text-sm leading-6">
                {t("progress", { finished, total: cards.length, submitted, failed })}
              </p>
              <progress
                className="h-2 w-full accent-[var(--a-accent)]"
                value={finished}
                max={cards.length}
                aria-label={t("progressLabel")}
              />
              <ol className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-[var(--a-border)] p-3 text-sm">
                {statuses.map((status, index) => (
                  <li key={index} className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                    <span>{t("cardNumber", { index: index + 1 })}</span>
                    <span className="text-[var(--a-muted)]">
                      {status.state === "failed" ? errorText(status.code) : t(status.state)}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-sm leading-6 text-[var(--a-muted)]">
                {running ? t("keepOpen") : t("resultNote")}
              </p>
              {!running && failed > 0 && (
                <button
                  type="button"
                  className={`${styles.secondary} disabled:cursor-not-allowed disabled:opacity-50`}
                  disabled={expired}
                  onClick={() => submit(true)}
                >
                  {t("retryFailed", { count: failed })}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
