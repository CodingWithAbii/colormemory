
import ColorMemoryChallenge from '@/components/game/color-memory-challenge';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 font-body">
      <ColorMemoryChallenge />
       <a href="https://github.com/CodingWithAbii/colormemory" target="_blank" rel="noopener noreferrer">
        View code on GitHub
      </a>
    </main>
  );
}
