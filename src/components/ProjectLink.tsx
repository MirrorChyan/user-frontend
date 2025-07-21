import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";

export interface ProjectLinkProps {
    text: string;
    locale?: string;
}

export default function ProjectLink({ text, locale }: ProjectLinkProps) {
    const currentLocale = locale || useLocale();

    return (
        <Link
            href="/projects"
            locale={currentLocale}
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
            {text}
        </Link>
    );
}
