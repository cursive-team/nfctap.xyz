import React from 'react'

export interface TextAreaProps
  extends React.ButtonHTMLAttributes<Partial<HTMLTextAreaElement>> {
  label?: string
}

const TextArea = React.forwardRef<HTMLDivElement, TextAreaProps>(
  (
    { className, label, children, ...props },
    ref
  ) => {
    return (
      <div className="w-full" ref={ref} >
        {label && 
          <div className="flex gap-2 p-2">
            <span className="text-xs font-normal font-helvetica text-woodsmoke-100 opacity-80">
              {label}
            </span>
          </div>
        }
        <textarea 
          className="flex min-h-[126px] bg-transparent w-full p-2 items-center flex-col text-base font-helvetica font-normal text-snow-flurry-200 border border-snow-flurry-200 rounded ring-0 focus:ring-0 outline:none justify-center"
          {...props}
        />
      </div>
    )
  }
)

TextArea.displayName = "TextArea"

export { TextArea }