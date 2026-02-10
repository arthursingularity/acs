export default function ThirdNavBar({ children }) {
    return (
        <div className="fixed top-[100px] left-0 w-full z-40">
            <div className="flex items-center bg-white h-[26px] font-bold tracking-wide text-[11px] border-b border-gray-300">
                {children}
            </div>
        </div>
    );
}
