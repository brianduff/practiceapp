import { ReactNode } from 'react'
import './ButtonBar.css';

export function button(text: string, onClick: () => void, enabled?: boolean): Button {
  return {
    text,
    onClick,
    enabled: enabled === undefined ? true : enabled
  }
}

export type Button = {
  text: string,
  onClick: () => void,
  enabled: boolean
}

type Props = {
  buttons: Button[]
}

export function ButtonBar({ buttons }: Props) {
  const buttonElements: ReactNode[] = []
  for (const button of buttons) {
    buttonElements.push(
      <button disabled={!button.enabled} id={button.text} onClick={button.onClick}>{button.text}</button>
    );
  }
  return (
    <div className="ButtonBar">
      {buttonElements}
    </div>
  );
}