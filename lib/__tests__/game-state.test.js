const {
  cloneGameState,
  createInitialGameState,
  setupWallAndDeal
} = require("../game-state");

describe("game state", () => {
  it("initializes analyzer-facing state fields", () => {
    const state = createInitialGameState();

    expect(state.wallFrontIndex).toBe(0);
    expect(state.wallBackIndex).toBe(-1);
    expect(state.lastDiscardTile).toBeNull();
    expect(state.lastDiscardPlayerIndex).toBeNull();
    expect(state.lastActionWasKong).toBe(false);
    expect(state.lastActionWasAddedKong).toBe(false);
    expect(state.roundWind).toBeNull();
    expect(state.initialHands).toEqual([[], [], [], []]);
    expect(state.players[0]).toEqual(
      expect.objectContaining({
        handTiles: [],
        melds: [],
        discards: [],
        flowerTiles: [],
        flowerCount: 0,
        initialHandTiles: [],
        lastDrawTile: null
      })
    );
  });

  it("deals 14 tiles to dealer and 13 to others", () => {
    const state = createInitialGameState();
    setupWallAndDeal(state, {
      wall: Array.from({ length: 144 }, (_, index) => index),
      dice: [1, 2, 3, 4],
      dealerIndex: 0
    });

    expect(state.players[0].handTiles).toHaveLength(14);
    expect(state.players[1].handTiles).toHaveLength(13);
    expect(state.players[2].handTiles).toHaveLength(13);
    expect(state.players[3].handTiles).toHaveLength(13);
  });

  it("rotates wall by dice-derived break position and captures initial hands", () => {
    const state = createInitialGameState();
    setupWallAndDeal(state, {
      wall: Array.from({ length: 144 }, (_, index) => index),
      dice: [1, 2, 3, 4],
      dealerIndex: 0
    });

    expect(state.wall[0]).toBe(92);
    expect(state.wallFrontIndex).toBe(53);
    expect(state.wallBackIndex).toBe(143);
    expect(state.initialHands[0]).toEqual(state.players[0].initialHandTiles);
    expect(state.initialHands[1]).toEqual(state.players[1].initialHandTiles);
  });

  it("clones without sharing nested arrays", () => {
    const state = createInitialGameState();
    setupWallAndDeal(state, {
      wall: Array.from({ length: 144 }, (_, index) => index),
      dice: [0, 0, 0, 0],
      dealerIndex: 0
    });

    const cloned = cloneGameState(state);
    cloned.players[0].handTiles.pop();
    cloned.initialHands[0].pop();

    expect(state.players[0].handTiles).toHaveLength(14);
    expect(state.initialHands[0]).toHaveLength(14);
  });
});
