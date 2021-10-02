import './Time.css';
import { Size, Color } from './enums';

type Props = {
  seconds: number,
  paused?: boolean,
  size?: Size,
  color?: Color
}

export function Time({ seconds, paused, size, color }: Props) {
  const minutes = Math.floor(seconds / 60);
  const secondsInMinute = seconds % 60;

  var displayedSeconds = "" + secondsInMinute;

  if (secondsInMinute < 10) {
    displayedSeconds = "0" + displayedSeconds;
  }

  var classes = []
  if (paused) classes.push("Paused")
  if (size === Size.Large) classes.push("LargeTime")
  if (color === Color.Green) classes.push("GreenTime")

  return (
    <span className={classes.join(" ")}>{minutes}:{displayedSeconds}</span>
  );
}