import { Stack, Text, Title } from "@mantine/core";

export default function HomePage() {
	return (
		<Stack align="center" justify="center" gap="sm" mih="100dvh" p="md">
			<Title order={1}>Voltaze</Title>
			<Text c="dimmed" size="sm" ta="center">
				Replace this page as you build the app.
			</Text>
		</Stack>
	);
}
