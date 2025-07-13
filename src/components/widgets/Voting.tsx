import React, { useState, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VotingProps {
  title?: string;
  optionA?: string;
  optionB?: string;
  initialVotesA?: number;
  initialVotesB?: number;
  onVoteChange?: (votesA: number, votesB: number) => void;
}

export const Voting: React.FC<VotingProps> = ({
  title = "Vote Now!",
  optionA = "Option A",
  optionB = "Option B",
  initialVotesA = 0,
  initialVotesB = 0,
  onVoteChange,
}) => {
  const [votesA, setVotesA] = useState(initialVotesA);
  const [votesB, setVotesB] = useState(initialVotesB);
  const [userVote, setUserVote] = useState<"A" | "B" | null>(null);

  const totalVotes = votesA + votesB;
  const percentageA =
    totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 0;
  const percentageB =
    totalVotes > 0 ? Math.round((votesB / totalVotes) * 100) : 0;

  const winner = votesA > votesB ? "A" : votesB > votesA ? "B" : "tie";

  const handleVote = useCallback(
    (option: "A" | "B") => {
      if (userVote === option) {
        // If user clicks the same option, remove their vote
        if (option === "A") {
          setVotesA((prev) => Math.max(0, prev - 1));
        } else {
          setVotesB((prev) => Math.max(0, prev - 1));
        }
        setUserVote(null);
      } else {
        // Remove previous vote if exists
        if (userVote === "A") {
          setVotesA((prev) => Math.max(0, prev - 1));
        } else if (userVote === "B") {
          setVotesB((prev) => Math.max(0, prev - 1));
        }

        // Add new vote
        if (option === "A") {
          setVotesA((prev) => prev + 1);
        } else {
          setVotesB((prev) => prev + 1);
        }
        setUserVote(option);
      }

      // Call the onChange callback with updated values
      const newVotesA =
        option === "A"
          ? userVote === "A"
            ? Math.max(0, votesA - 1)
            : votesA + (userVote === "B" ? 0 : 1)
          : userVote === "A"
          ? Math.max(0, votesA - 1)
          : votesA;
      const newVotesB =
        option === "B"
          ? userVote === "B"
            ? Math.max(0, votesB - 1)
            : votesB + (userVote === "A" ? 0 : 1)
          : userVote === "B"
          ? Math.max(0, votesB - 1)
          : votesB;

      onVoteChange?.(newVotesA, newVotesB);
    },
    [userVote, votesA, votesB, onVoteChange]
  );

  const resetVotes = useCallback(() => {
    setVotesA(0);
    setVotesB(0);
    setUserVote(null);
    onVoteChange?.(0, 0);
  }, [onVoteChange]);

  return (
    <Card className="w-full max-w-[288px] min-w-[288px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm">{totalVotes}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Option A */}
        <div className="space-y-2">
          <Button
            variant={userVote === "A" ? "default" : "outline"}
            className={cn(
              "w-full h-12 justify-between text-left",
              userVote === "A" && "bg-blue-500 hover:bg-blue-600 text-white",
              winner === "A" &&
                userVote !== "A" &&
                "border-green-500 bg-green-50 dark:bg-green-950"
            )}
            onClick={() => handleVote("A")}
          >
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-4 h-4" />
              <span className="font-medium">{optionA}</span>
              {winner === "A" && <Trophy className="w-4 h-4 text-yellow-500" />}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold">{votesA}</span>
              <span className="text-xs">({percentageA}%)</span>
            </div>
          </Button>

          {/* Progress bar for Option A */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                winner === "A" ? "bg-green-500" : "bg-blue-500"
              )}
              style={{ width: `${percentageA}%` }}
            />
          </div>
        </div>

        {/* Option B */}
        <div className="space-y-2">
          <Button
            variant={userVote === "B" ? "default" : "outline"}
            className={cn(
              "w-full h-12 justify-between text-left",
              userVote === "B" &&
                "bg-purple-500 hover:bg-purple-600 text-white",
              winner === "B" &&
                userVote !== "B" &&
                "border-green-500 bg-green-50 dark:bg-green-950"
            )}
            onClick={() => handleVote("B")}
          >
            <div className="flex items-center space-x-2">
              <ThumbsDown className="w-4 h-4" />
              <span className="font-medium">{optionB}</span>
              {winner === "B" && <Trophy className="w-4 h-4 text-yellow-500" />}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold">{votesB}</span>
              <span className="text-xs">({percentageB}%)</span>
            </div>
          </Button>

          {/* Progress bar for Option B */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                winner === "B" ? "bg-green-500" : "bg-purple-500"
              )}
              style={{ width: `${percentageB}%` }}
            />
          </div>
        </div>

        {/* Results summary */}
        <div className="pt-2 border-t border-border">
          <div className="text-center">
            {winner === "tie" && totalVotes > 0 && (
              <p className="text-sm text-muted-foreground">It's a tie!</p>
            )}
            {winner !== "tie" && totalVotes > 0 && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {winner === "A" ? optionA : optionB}
                </span>{" "}
                is winning!
              </p>
            )}
            {totalVotes === 0 && (
              <p className="text-sm text-muted-foreground">No votes yet</p>
            )}
          </div>

          {totalVotes > 0 && (
            <div className="mt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetVotes}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset Votes
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Voting;
