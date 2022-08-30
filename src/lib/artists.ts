import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"
import { client } from "./db"

export async function getArtists() {
  const command = new ScanCommand({
    TableName: "rappers"
  })
  return client().send(command)
}

export async function getArtist(artist: number) {
  const command = new GetCommand({
    TableName: "rappers",
    Key: { id: artist }
  })
  return client().send(command)
}
