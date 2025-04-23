export const generateColorFromName = (name: string) => {
  // List of visually appealing background colors
  const bgColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-rose-500",
    "bg-violet-500",
  ];

  // List of contrasting text colors (not white or black)
  const textColors = [
    "text-yellow-300",
    "text-pink-200",
    "text-lime-200",
    "text-amber-200",
    "text-emerald-200",
    "text-fuchsia-200",
    "text-sky-200",
    "text-orange-200",
    "text-teal-200",
    "text-blue-200",
  ];

  // Simple hash function to convert name to a number
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to select colors from the arrays
  const bgIndex = Math.abs(hash) % bgColors.length;
  // Use a different position for text color to avoid potential clashes
  const textIndex = Math.abs(hash + 3) % textColors.length;
  
  // Return combined classes
  return `${bgColors[bgIndex]} ${textColors[textIndex]}`;
};