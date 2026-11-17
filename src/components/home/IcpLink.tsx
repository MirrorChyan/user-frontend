import type { ICP } from "@/app/requests/icp";

export default function IcpLink({ icp, className }: { icp: ICP; className?: string }) {
  return (
    <div className={className}>
      <a
        href={icp.icp_url}
        target="_blank"
        className="text-xs text-gray-500 dark:text-gray-400"
        rel="noreferrer"
      >
        {icp.icp_beian}
        <span aria-hidden="true">&nbsp;&nbsp;</span>
        {icp.icp_entity}
      </a>
    </div>
  );
}
