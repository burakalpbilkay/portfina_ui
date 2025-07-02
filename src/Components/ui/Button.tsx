export default function Button({
    children,
    onClick,
    disabled,
    className = '',
  }: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
  }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 ${className}`}
      >
        {children}
      </button>
    );
  }
  