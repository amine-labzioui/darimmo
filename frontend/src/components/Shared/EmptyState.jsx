export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-[#F0EAD8] flex items-center justify-center mb-4">
          <Icon size={24} className="text-[#047857]" />
        </div>
      )}
      <h3
        className="text-lg text-[#1C2520] mb-1.5"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#5C6961] max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
