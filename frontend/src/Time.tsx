import './Time.css';
import { Size } from './size';

type Props = {
  seconds: number,
  paused?: boolean,
  size?: Size,
}

export function Time({ seconds, paused, size }: Props) {
  const minutes = Math.floor(seconds / 60);
  const secondsInMinute = seconds % 60;

  var displayedSeconds = "" + secondsInMinute;

  if (secondsInMinute < 10) {
    displayedSeconds = "0" + displayedSeconds;
  }

  var classes = []
  if (paused) classes.push("Paused")
  if (size === Size.Large) classes.push("LargeTime")

  return (
    <div className={classes.join(" ")}>{minutes}:{displayedSeconds}</div>
  );
}