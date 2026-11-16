const ex = (name, sets, reps, group) => ({
  id: name.toLowerCase().replace(/\W+/g, "-"),
  name,
  sets,
  reps,
  group,
});
// Copied from your Yogi Fitness chart. days: 0=Sun … 6=Sat
export const DEFAULT_PLAN = {
  A: {
    title: "Shoulders & Arms",
    days: [1, 3, 5],
    items: [
      ex("Dand (push-up)", 5, "25-30", "Warm-up/Core"),
      ex("DB Arnold Press", 3, "15,12,10", "Shoulders"),
      ex("BB Shoulder Press", 3, "15,12,10", "Shoulders"),
      ex("DB Side Raise", 3, "15,12,10", "Shoulders"),
      ex("DB Front Raise", 3, "15,12,10", "Shoulders"),
      ex("DB Curl", 3, "15,12,10", "Biceps"),
      ex("BB Curl", 3, "15,12,10", "Biceps"),
      ex("Preacher Curl + DB Curl (superset)", 3, "15,12,10", "Biceps"),
      ex("DB Hammer Curl", 3, "15", "Biceps"),
      ex("Pulley Triceps", 3, "15,12,10", "Triceps"),
      ex("DB One-hand Triceps", 3, "15,12,10", "Triceps"),
      ex(
        "Pulley Rope Triceps + DB Overhead (superset)",
        3,
        "15,12,10",
        "Triceps",
      ),
      ex("BB Wrist Curl", 3, "20", "Forearms"),
      ex("Pulley Reverse Curl", 3, "15", "Forearms"),
    ],
  },
  B: {
    title: "Chest, Back & Legs",
    days: [2, 4, 6],
    items: [
      ex("Push-ups", 5, "25-30", "Chest"),
      ex("Incline DB Chest Press", 3, "15,12,10", "Chest"),
      ex("BB Chest Press", 3, "15,12,10", "Chest"),
      ex("Pec Fly M/C + Chest Press M/C (superset)", 3, "15,12,10", "Chest"),
      ex("Pull-ups", 3, "15", "Back"),
      ex("Lat Pull Down", 3, "15,12,10", "Back"),
      ex("DB Rowing", 3, "15,12,10", "Back"),
      ex("Pulley Rowing", 3, "15,12,10", "Back"),
      ex("Knee Sit (wall hold)", 2, "90 sec", "Legs"),
      ex("Free Squats", 2, "25", "Legs"),
      ex("BB Squats", 3, "15,12,10", "Legs"),
      ex("Leg Extension", 3, "15,12,10", "Legs"),
      ex("Leg Curl", 3, "15,12,10", "Legs"),
      ex("Standing Calf Raise", 3, "20", "Legs"),
    ],
  },
};
export const makeExercise = ex;
