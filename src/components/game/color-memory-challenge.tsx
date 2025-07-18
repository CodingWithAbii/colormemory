
"use client";

import { useState, useEffect, useCallback } from "react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, Check, Info, Palette, Play, RotateCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameState, GridItem, Level, Question } from "@/types";

const GAME_COLORS = [
  { name: "red", tw: "bg-red-500", hex: "#ef4444" },
  { name: "blue", tw: "bg-blue-500", hex: "#3b82f6" },
  { name: "green", tw: "bg-green-500", hex: "#22c55e" },
  { name: "yellow", tw: "bg-yellow-400", hex: "#facc15" },
  { name: "purple", tw: "bg-purple-500", hex: "#a855f7" },
  { name: "orange", tw: "bg-orange-500", hex: "#f97316" },
  { name: "pink", tw: "bg-pink-500", hex: "#ec4899" },
];

const LEVELS: Level[] = [
  { level: 1, gridSize: 9, numColors: 3, memorizationTime: 5000, questionTypes: ["clickAll"] },
  { level: 2, gridSize: 9, numColors: 4, memorizationTime: 5000, questionTypes: ["clickAll", "howMany"] },
  { level: 3, gridSize: 16, numColors: 4, memorizationTime: 6000, questionTypes: ["clickAll", "howMany"] },
  { level: 4, gridSize: 16, numColors: 5, memorizationTime: 6000, questionTypes: ["whatColorAt", "howMany"] },
  { level: 5, gridSize: 25, numColors: 5, memorizationTime: 7000, questionTypes: ["clickAll", "howMany", "whatColorAt"] },
  { level: 6, gridSize: 25, numColors: 6, memorizationTime: 7000, questionTypes: ["clickAll", "howMany", "whatColorAt"] },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  return array.sort(() => Math.random() - 0.5);
};

const ColorMemoryChallenge: FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [gridData, setGridData] = useState<GridItem[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [userSelection, setUserSelection] = useState<number[] | number | string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const currentLevelConfig = LEVELS[Math.min(level, LEVELS.length) - 1];

  const generateGridAndQuestion = useCallback(() => {
    const { gridSize, numColors, questionTypes } = currentLevelConfig;
    const availableColors = shuffleArray(GAME_COLORS).slice(0, numColors);
    const newGrid: GridItem[] = Array.from({ length: gridSize }, (_, i) => ({
      id: i,
      color: availableColors[Math.floor(Math.random() * availableColors.length)],
    }));
    setGridData(newGrid);

    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let newQuestion: Question;

    const targetColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    const correctIndices = newGrid.map((item, index) => (item.color.name === targetColor.name ? index : -1)).filter(index => index !== -1);

    switch (questionType) {
      case "howMany":
        newQuestion = {
          type: "howMany",
          text: `How many ${targetColor.name} squares were there?`,
          targetColor: targetColor.name,
          answer: correctIndices.length,
        };
        break;
      case "whatColorAt":
        const targetPosition = Math.floor(Math.random() * gridSize);
        newQuestion = {
            type: 'whatColorAt',
            text: `What color was in square number ${targetPosition + 1}?`,
            targetPosition: targetPosition,
            answer: newGrid[targetPosition].color.name,
        };
        break;
      case "clickAll":
      default:
        newQuestion = {
          type: "clickAll",
          text: `Click on all ${targetColor.name} squares.`,
          targetColor: targetColor.name,
          answer: correctIndices,
        };
        break;
    }
    setQuestion(newQuestion);
    setUserSelection(questionType === 'clickAll' ? [] : null);
  }, [currentLevelConfig]);

  const handleStart = () => {
    setLevel(1);
    setScore(0);
    setGameState("memorizing");
    setTimeLeft(currentLevelConfig.memorizationTime);
    generateGridAndQuestion();
  };

  const handleRestart = () => {
    setGameState("idle");
  };

  const handleNextLevel = () => {
    setGameState("memorizing");
    setTimeLeft(currentLevelConfig.memorizationTime);
    generateGridAndQuestion();
  }

  useEffect(() => {
    if (gameState === "memorizing") {
      const gameTimer = setTimeout(() => {
        setGameState("answering");
      }, timeLeft);

      const interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 10 : 0));
      }, 10);
      return () => {
        clearTimeout(gameTimer);
        clearInterval(interval);
      };
    }
  }, [gameState, timeLeft]);
  
  const handleSquareClick = (id: number) => {
    if (gameState !== 'answering' || question?.type !== 'clickAll') return;
    setUserSelection(prev => {
        const prevSelection = Array.isArray(prev) ? prev : [];
        if(prevSelection.includes(id)) {
            return prevSelection.filter(item => item !== id);
        } else {
            return [...prevSelection, id];
        }
    });
  };

  const handleAnswerSubmission = () => {
    if (!question || userSelection === null) return;
    let isCorrect = false;
    if (question.type === 'clickAll' && Array.isArray(userSelection) && Array.isArray(question.answer)) {
        isCorrect = userSelection.length === question.answer.length && userSelection.every(val => question.answer.includes(val));
    } else if (JSON.stringify(userSelection) === JSON.stringify(question.answer)) {
        isCorrect = true;
    }

    if (isCorrect) {
      setScore(prev => prev + 100 * level);
      setGameState('result_correct');
      setLevel(prev => prev + 1);
    } else {
      setGameState('result_incorrect');
    }
  }

  const renderGrid = () => {
    const showColors = gameState === "memorizing" || gameState === 'result_correct' || gameState === 'result_incorrect';
    const isClickable = gameState === 'answering' && question?.type === 'clickAll';
    const gridSizeClass = `grid-cols-${Math.sqrt(currentLevelConfig.gridSize)}`;
    
    return (
      <div className={cn("grid gap-2 w-full max-w-md mx-auto my-4", gridSizeClass)} style={{gridTemplateColumns: `repeat(${Math.sqrt(currentLevelConfig.gridSize)}, minmax(0, 1fr))`}}>
        {gridData.map(({ id, color }) => {
          const isSelected = Array.isArray(userSelection) && userSelection.includes(id);
          const isCorrectAnswer = (gameState === 'result_correct' || gameState === 'result_incorrect') && (question?.answer as any[]).includes(id);

          return (
            <div
              key={id}
              onClick={() => isClickable && handleSquareClick(id)}
              className={cn(
                "aspect-square rounded-lg transition-all duration-300 flex items-center justify-center text-white font-bold text-xl",
                showColors ? color.tw : "bg-muted hover:bg-secondary",
                isClickable && "cursor-pointer",
                isSelected && "ring-4 ring-accent ring-offset-2 ring-offset-background",
                (gameState === 'result_incorrect' && (question?.answer as any[]).includes(id) && !isSelected) && "ring-4 ring-red-500",
                (gameState === 'result_correct' && isSelected) && "ring-4 ring-green-500",
              )}
            >
             { gameState === 'answering' && question?.type === 'whatColorAt' && question.targetPosition === id && '?' }
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderAnswerInterface = () => {
    if (gameState !== 'answering' || !question) return null;

    switch (question.type) {
      case 'howMany':
        return (
          <div className="flex justify-center gap-2 flex-wrap">
            {Array.from({ length: 6 }).map((_, i) => (
              <Button key={i} variant={userSelection === i ? 'default' : 'secondary'} onClick={() => setUserSelection(i)}>{i}</Button>
            ))}
          </div>
        )
      case 'whatColorAt':
         return (
          <div className="flex justify-center gap-2 flex-wrap">
            {shuffleArray(GAME_COLORS.slice(0, currentLevelConfig.numColors)).map(color => (
              <Button key={color.name} style={{backgroundColor: userSelection === color.name ? color.hex : undefined }} className={cn(userSelection !== color.name && "bg-secondary text-secondary-foreground hover:bg-primary/80")} onClick={() => setUserSelection(color.name)}>{color.name}</Button>
            ))}
          </div>
        )
      default:
        return null;
    }
  }


  if (gameState === "idle") {
    return (
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <div className="flex justify-center items-center gap-2">
            <BrainCircuit className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-bold">Color Memory</CardTitle>
          </div>
          <CardDescription className="pt-2">Test your memory and color recognition speed!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Memorize the color grid. After a short time, the colors will disappear and you will be asked a question. Good luck!</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full text-lg" size="lg" onClick={handleStart}>
            <Play className="mr-2 h-6 w-6" /> Start Game
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const renderResultFooter = () => {
    if(gameState === 'result_correct') {
      return (
        <Button className="w-full" onClick={handleNextLevel} variant="default">
          Next Level <Check className="ml-2 h-5 w-5"/>
        </Button>
      )
    }
    if (gameState === 'result_incorrect') {
      return (
        <Button className="w-full" onClick={handleRestart} variant="destructive">
            Play Again <RotateCw className="ml-2 h-5 w-5"/>
        </Button>
      )
    }
    return null;
  }
  
  const getResultIcon = () => {
    if(gameState === 'result_correct') return <Check className="h-8 w-8 text-green-500" />;
    if(gameState === 'result_incorrect') return <X className="h-8 w-8 text-red-500" />;
    return <Info className="h-8 w-8 text-primary" />;
  }
  
  const getResultTitle = () => {
    if(gameState === 'result_correct') return "Correct!";
    if(gameState === 'result_incorrect') return "Incorrect! Game Over.";
    if (gameState === 'memorizing') return "Memorize the colors!";
    return question?.text || "";
  }
  
  const getResultDescription = () => {
    if(gameState === 'result_correct') return `Great! You earned ${100 * (level-1)} points.`;
    if(gameState === 'result_incorrect') return `Your final score is ${score}. Better luck next time!`;
    if(gameState === 'memorizing') return "Watch the grid carefully...";
    return "Select your answer.";
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl animate-fade-in">
        <CardHeader className="text-center">
             <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Level: {level}</p>
                <p className="text-lg font-bold">Score: {score}</p>
             </div>
            {gameState === 'memorizing' && (
                <Progress value={(timeLeft / currentLevelConfig.memorizationTime) * 100} className="w-full mt-2" />
            )}
            <div className="flex justify-center items-center gap-3 pt-4">
              {getResultIcon()}
              <CardTitle className="text-2xl">{getResultTitle()}</CardTitle>
            </div>
            <CardDescription>{getResultDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
            {renderGrid()}
            {renderAnswerInterface()}
        </CardContent>
        <CardFooter>
            {gameState === 'answering' && (
                 <Button className="w-full" onClick={handleAnswerSubmission}>Confirm Answer</Button>
            )}
            {renderResultFooter()}
        </CardFooter>
    </Card>
  )
};

export default ColorMemoryChallenge;

    