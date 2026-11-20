import {
    GameState
} from "./types";
import persona from "@/data/persona.json" with { type: "json" };

export function createGame(week = 1): GameState {
    const state: GameState = {
        week: week,
        balance: 0,
        status: "playing",
        score: 0,
        answered: ["1"],
        decisions: ["1"]
    }
    return state;
}