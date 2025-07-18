
export type ColorInfo = {
  name: string;
  tw: string;
  hex: string;
};

export type GridItem = {
  id: number;
  color: ColorInfo;
};

export type QuestionType = 'clickAll' | 'howMany' | 'whatColorAt';

export type Question = {
  type: QuestionType;
  text: string;
  targetColor?: string;
  targetPosition?: number;
  answer: number[] | number | string;
};

export type Level = {
  level: number;
  gridSize: 9 | 16 | 25;
  numColors: number;
  memorizationTime: number;
  questionTypes: QuestionType[];
};

export type GameState = 'idle' | 'memorizing' | 'answering' | 'result_correct' | 'result_incorrect';
