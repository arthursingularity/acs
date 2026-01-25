import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ThirdNavItem({ label, link, onClick }) {
    const pathname = usePathname();
    const active = pathname === link;

    return (
        <Link
            href={link}
            className={`h-full px-2 flex items-center rounded border-2
                ${active
                    ? "bg-primary3 text-white border-primary3 buttonHover"
                    : "border-primary3 text-primary3 hover:bg-primarySoft hover:text-black hover:border-black"}
            `}
            onClick={onClick}
        >
            {label}
        </Link>
    );
}