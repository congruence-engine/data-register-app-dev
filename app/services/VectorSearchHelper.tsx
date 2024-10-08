"use client";
import { pipeline } from "@xenova/transformers";
import { env } from "@xenova/transformers";
import { WBEntity } from "./MediaWikiAPI";
env.allowLocalModels = false;
env.allowRemoteModels = true;

export const getEmbeddings = async (data: string[]): Promise<number[][]> => {

  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/bge-base-en-v1.5"
  );
  const embeddings: number[][] = await Promise.all(
    data.map(async (item) => {
      const output = await extractor(item, {
        pooling: "mean",
        normalize: true,
      });
      return output.tolist()[0];
    })
  );
  return embeddings;
};

export function cosinesim(A: number[], B: number[]) {
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;

  for (let i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }

  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  const similarity = dotproduct / (mA * mB);

  return similarity;
}

export function generateTextStructureForEmbeddings(wikiBaseItems: WBEntity[]): string[] {
  const embeddingTextStructure: string[] = [];

  wikiBaseItems.forEach((item: WBEntity) => {
    let tempTextString = item.label ? item.label.trim() : "";
    // if (item.datasetHeldBy.value.trim()) {
    //   tempTextString = tempTextString + " " + item.datasetHeldBy.value.trim();
    // }
    if (item.description) {
      tempTextString = tempTextString + " " + item.description.trim();
    }
    if (item.statements?.keywords) {
      tempTextString =
        tempTextString +
        " " +
        item.statements.keywords.map((property) => property.value).join(", ");
    }
    embeddingTextStructure.push(tempTextString);
  });

  return embeddingTextStructure;
}
