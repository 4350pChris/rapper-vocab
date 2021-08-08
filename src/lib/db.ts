import { DynamoDBClient, BatchWriteItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
	region: 'eu-central-1',
	endpoint: import.meta.env.DEV ? 'http://localhost:8000' : undefined
});

export async function getSongs(artist: string) {
	const command = new QueryCommand({
		TableName: "songs",
		KeyConditionExpression: "#artist = :artist",
		ExpressionAttributeNames: { "#artist": "artistId" },
		ExpressionAttributeValues: { ":artist": { N: artist} }
	})
	return await client.send(command)
}

export async function putSongs(chunks: Record<string, any>[][]) {
	const artist: Record<string, any> = chunks[0][0].primary_artist;
	
	return Promise.all(
		chunks.map((chunk) => {
			const command = new BatchWriteItemCommand({
				RequestItems: {
					rappers: [
						{
							PutRequest: {
								Item: {
									id: { N: artist.id.toString() },
									name: { S: artist.name },
									image_url: { S: artist.image_url }
								}
							}
						}
					],
					songs: chunk.map((song) => ({
						PutRequest: {
							Item: {
								id: { N: song.id.toString() },
								artistId: { N: song.primary_artist.id.toString() },
								title: { S: song.title },
								lyrics: { S: song.lyrics }
							}
						}
					}))
				}
			});
			return client.send(command);
		})
	);
}
