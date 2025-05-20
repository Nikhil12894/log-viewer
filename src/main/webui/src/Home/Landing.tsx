import { useEffect, useState } from 'react';
import { TextInput, Button, Container, Group, Stack, Title, Paper, Text } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getBaseDir } from '../services/logViewerService';

export default function Landing() {
  const [inputPath, setInputPath] = useState('');
  const navigate = useNavigate();
  // Load the baseDir from backend api or local storage

  const [baseDir, setBaseDir] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the baseDir from local storage or backend API
  useEffect(() => {
    const storedPath = localStorage.getItem('baseDir');
    if (storedPath) {
      setBaseDir(storedPath);
      setInputPath(storedPath);
      setLoading(false);
    } else {
      const loadBaseDir = async () => {
        try {
          const baseDir = await getBaseDir();
          setBaseDir(baseDir);
          setInputPath(baseDir);
          localStorage.setItem('baseDir', baseDir);
        } catch (error) {
          console.error('Failed to load baseDir:', error);
        } finally {
          setLoading(false);
        }
      };

      loadBaseDir();
    }
  }, []);
  const handleSubmit = () => {
    if (inputPath.trim()) {
      // save to local storage
      localStorage.setItem('currentPath', inputPath);
      navigate('/explorer');
    }
  };
  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Stack gap="lg">
          <Title order={2}>File Explorer</Title>
          <Text>Loading...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={2}>File Explorer</Title>
        <Group>
          <TextInput
            placeholder="Enter root directory path"
            value={inputPath}
            onChange={(e) => setInputPath(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={handleSubmit}>
            <IconArrowRight size={20} />
          </Button>
        </Group>

        <Paper shadow="xs" p="md" radius="md" withBorder>
          <Title order={4}>📘 How to Use</Title>
          <Text mt="sm">
            1. Enter the absolute path of a directory you want to browse.
          </Text>
          <Text mt="sm">
            2. Path should be a subpath of <strong>{baseDir}</strong>.
          </Text>
          <Text mt="sm">
            3. Click the arrow button to load the contents.
          </Text>
          <Text mt="sm">
            4. Click to expand folders, double-click to open a folder.
          </Text>
          <Text mt="sm">
            5. To go back, double-click the parent entry (if available) or refresh.
          </Text>
          <Text mt="sm">
            6. Files are read-only and displayed as a tree view.
          </Text>
          <Text mt="sm">
            7. To change the base directory, modify the <strong>baseDir</strong> in the backend config.
          </Text>
        </Paper>

      </Stack>
    </Container>
  );
}
