export default function NavBar({ almo, setAlmo, onExportExcel }) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-sky-600 h-[50px] flex items-center justify-center space-x-2">
        <input
          className="border w-[120px] px-2 py-1 rounded bg-white"
          placeholder="Almoxarifado"
          value={almo}
          onChange={(e) => setAlmo(e.target.value)}
        />
        <button
          onClick={onExportExcel}
          className="bg-emerald-500 px-3 py-1 rounded-lg font-bold buttonHover"
        >
          Excel
        </button>
      </div>
    );
  }
  