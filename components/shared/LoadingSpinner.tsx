const LoadingInline = ({
  className,
  style
}: Pick<Partial<HTMLDivElement>, "className" | "style">) => {
  return (
    <div
      className={`animate-lsd-facebook-animation inline-block absolute w-[8px] bg-woodsmoke-100 ${className}`}
      style={{ ...style } as any}
    >
    </div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="inline-block relative w-10 h-10">
      <LoadingInline
        className="left-[4px]"
        style={{
          animationDelay: "-0.24s",
        } as any}
      />
      <LoadingInline
        className="left-[16px]"
        style={{
          animationDelay: "-0.12s",
        } as any}
      />
      <LoadingInline
        className="left-[28px]"
        style={{
          animationDelay: "0",
        } as any}
      />
    </div>
  );
};