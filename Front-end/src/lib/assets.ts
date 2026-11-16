import Logo from "@/assets/image 1.png";
import BooksImg from "@/assets/image 2.png";
import ComputerScienceImg from "@/assets/computer science.png";
import MathematicsImg from "@/assets/Mathec.png";
import LiteratureImg from "@/assets/literature.png";
import HistoryImg from "@/assets/History.png";
import InfoTechImg from "@/assets/information T.png";
import AlgoImg from "@/assets/Algo.png";
import JavaOopImg from "@/assets/java oop.png";
import CalculusImg from "@/assets/calculos.png";
import MachinesLearnImg from "@/assets/machine.png";
import History1 from "@/assets/image 22.png";
import History2 from "@/assets/image 23.png";
import History3 from "@/assets/image 24.png";

const map: Record<string, string> = {
  "image 1.png": Logo,
  "image 2.png": BooksImg,
  "computer science.png": ComputerScienceImg,
  "Mathec.png": MathematicsImg,
  "literature.png": LiteratureImg,
  "History.png": HistoryImg,
  "history.png": HistoryImg,
  "information T.png": InfoTechImg,
  "Algo.png": AlgoImg,
  "java oop.png": JavaOopImg,
  "calculos.png": CalculusImg,
  "machine.png": MachinesLearnImg,
  "image 22.png": History1,
  "image 23.png": History2,
  "image 24.png": History3,
};

export function resolveAsset(image?: string | null): string {
  if (!image) return "";
  if (image.startsWith("http") || image.startsWith("data:") || image.startsWith("/")) return image;
  return map[image] || "";
}

export {
  Logo,
  BooksImg,
  ComputerScienceImg,
  MathematicsImg,
  LiteratureImg,
  HistoryImg,
  InfoTechImg,
  AlgoImg,
  JavaOopImg,
  CalculusImg,
  MachinesLearnImg,
};
