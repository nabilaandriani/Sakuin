import { useEffect, useRef, useState } from "react";
import { ImFire } from "react-icons/im";
import { useStreakContext } from "./StreakContext";
import "../style/streak.css";

export default function StreakPopup() {
  const { streak } = useStreakContext();
  const { streakCount, streakBump } = streak;

  const [visible, setVisible] = useState(false);
  const prevBumpRef = useRef(streakBump); 

  useEffect(() => {
    if (streakBump === prevBumpRef.current) return;

    if (streakBump > prevBumpRef.current) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2200);
      prevBumpRef.current = streakBump;
      return () => clearTimeout(timer);
    }

    prevBumpRef.current = streakBump;
  }, [streakBump]);

  if (!visible) return null;

  return (
    <div className="streak-popup-overlay">
      <div className="streak-popup-toast-inner">
        <ImFire className="streak-popup-toast-icon" />
        <div className="streak-popup-toast-text">
          <span className="streak-popup-toast-title">Streak +1!</span>
          <span className="streak-popup-toast-desc">
            {streakCount} hari beruntun
          </span>
        </div>
      </div>
    </div>
  );
}