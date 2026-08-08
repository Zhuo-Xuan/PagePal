import { useState, useEffect } from "react";

export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem("pagepal_streak");
    const data = stored ? JSON.parse(stored) : null;

    if (!data) {
 
      localStorage.setItem("pagepal_streak", JSON.stringify({ lastDate: today, count: 1 }));
      setStreak(1);
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (data.lastDate === today) {
      
      setStreak(data.count);
    } else if (data.lastDate === yesterdayStr) {
      
      const newCount = data.count + 1;
      localStorage.setItem("pagepal_streak", JSON.stringify({ lastDate: today, count: newCount }));
      setStreak(newCount);
    } else {

      localStorage.setItem("pagepal_streak", JSON.stringify({ lastDate: today, count: 1 }));
      setStreak(1);
    }
  }, []);

  return streak;
}
