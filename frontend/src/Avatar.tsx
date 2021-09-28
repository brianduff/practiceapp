import './Avatar.css'

export enum Size {
  Small,
  Medium,
  Large
}

type Props = {
  url: string,
  size?: Size
}

export function Avatar({ url, size }: Props) {
  if (!size) {
    size = Size.Medium;
  }

  return (
    <img src={url} alt="Avatar" className={`Avatar ${Size[size]}`} />
  )
}