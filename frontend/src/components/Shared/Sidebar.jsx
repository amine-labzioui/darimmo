import { NavLink } from "react-router-dom";

export default function Sidebar({ items, title }) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      {title && (
        <p className="text-[12.5px] font-medium tracking-wide uppercase text-[#8C9189] px-3 mb-3">
          {title}
        </p>
      )}
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scroll-x-mobile pb-2 lg:pb-0">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] whitespace-nowrap transition-colors duration-150 ${
                isActive
                  ? "bg-[#047857] text-white font-medium"
                  : "text-[#3F4A43] hover:bg-[#F0EAD8]"
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
