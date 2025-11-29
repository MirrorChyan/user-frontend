import { Link } from "@/i18n/routing";
import clsx from "clsx";

interface HomeButtonProps {
  className?: string;
}

export default function HomeButton({ className }: HomeButtonProps) {
  return (
    <Link
      href="/get-start"
      className={clsx(
        "inline-flex items-center justify-center rounded-full bg-white/10 p-2 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:opacity-100",
        "h-10 w-10", // Fixed size container
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6" // Explicit icon size
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    </Link>
  );
}
