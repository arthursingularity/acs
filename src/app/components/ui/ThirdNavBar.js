export default function ThirdNavBar({ children }) {
    return (
        <div className="fixed top-[100px] left-0 w-full z-40">
            <div className="flex items-center bg-white h-[27px] font-bold tracking-wide text-[13px] border-b border-gray-300">
                {children}
            </div>
        </div>
    );
}
