import localforage from "localforage";
import { Slide } from "./ai";
import { Message } from "../components/Chat";

export interface PresentationHistory {
  id: string;
  filename: string;
  documentText: string;
  slides: Slide[];
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORE_KEY = "slidegenius_history";

export async function savePresentation(
  id: string,
  filename: string,
  documentText: string,
  slides: Slide[],
  messages: Message[]
): Promise<void> {
  try {
    const history = await getHistory();
    const existingIndex = history.findIndex((item) => item.id === id);
    
    const presentation: PresentationHistory = {
      id,
      filename,
      documentText,
      slides,
      messages,
      createdAt: existingIndex >= 0 ? history[existingIndex].createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      history[existingIndex] = presentation;
    } else {
      history.unshift(presentation);
    }

    await localforage.setItem(STORE_KEY, history);
  } catch (error) {
    console.error("Failed to save presentation history:", error);
  }
}

export async function getHistory(): Promise<PresentationHistory[]> {
  try {
    const history = await localforage.getItem<PresentationHistory[]>(STORE_KEY);
    return history || [];
  } catch (error) {
    console.error("Failed to get presentation history:", error);
    return [];
  }
}

export async function deletePresentation(id: string): Promise<void> {
  try {
    const history = await getHistory();
    const updatedHistory = history.filter((item) => item.id !== id);
    await localforage.setItem(STORE_KEY, updatedHistory);
  } catch (error) {
    console.error("Failed to delete presentation:", error);
  }
}
