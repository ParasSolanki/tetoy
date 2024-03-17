import { z } from "zod";
import {
  storageDimensionMap,
  storageDimensionSchema,
} from "../common/storages.schema.js";

const CHARACTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
];

export function getBlocksFromDimension(
  dimension: z.infer<typeof storageDimensionSchema>
) {
  const d = storageDimensionMap[dimension];
  let boxes = [];

  for (let row = 1; row <= d.row; row++) {
    let char = CHARACTERS[row - 1];
    for (let col = 1; col <= d.column; col++) {
      boxes.push({
        name: `${char}${col}`,
        row,
        column: col,
      });
    }
  }

  return boxes;
}
