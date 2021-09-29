import { ReactNode } from 'react'
import './ButtonBar.css';

export function button(text: string, onClick: () => void): Button {
  return {
    text,
    onClick
  }
}

export type Button = {
  text: string,
  onClick: () => void
}

type Props = {
  buttons: Button[]
}

export function ButtonBar({ buttons }: Props) {
  const buttonElements: ReactNode[] = []
  for (const button of buttons) {
    buttonElements.push(
      <button id={button.text} onClick={button.onClick}>{button.text}</button>
    );
  }


  return (
    <div className="ButtonBar">
      {buttonElements}
    </div>
  );
}