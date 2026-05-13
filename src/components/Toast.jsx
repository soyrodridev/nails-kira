export default function Toast({
  open,
  message,
}) {

  return (
    <div
      className={`
        fixed top-30 right-0 md:right-5
        z-999
        bg-black text-white
        px-5 py-3
        rounded-2xl
        shadow-2xl
        transition-all duration-300
        ${open
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-5 pointer-events-none"
        }
      `}
    >
      {message}
    </div>
  );
}