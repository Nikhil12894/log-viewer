import { ActionIcon, AppShell, Group, ScrollArea, Tooltip, useTree } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowBackUp, IconHome } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileExplorer1 from '../FileExplorer/FileExplorer';
import MonacoLogViewer from '../LogViewer/MonacoLogViewer';
import { ModeSwitcher } from '../ModeSwitcher/ModeSwitcher';

function MainApp() {
    const selectedRootPath = localStorage.getItem('currentPath') ?? '/var/log';
    const baseDirectory = localStorage.getItem('baseDir');
    const [opened] = useDisclosure();
    const [currentPath, setCurrentPath] = useState(selectedRootPath);
    const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
    const navigate = useNavigate();

    const tree = useTree(); // or however you manage tree

    const parentDir = currentPath?.substring(0, currentPath?.lastIndexOf('/')) || '/';

    const handleGoUp = () => {
        setCurrentPath(parentDir);
    };
    // Optional: react to file selection changes
    useEffect(() => {
        if (selectedFilePath) {
            // Optionally do things like:
            // scroll viewer into view
            // fetch metadata
        }
    }, [selectedFilePath]);

    return (
        <AppShell
            // header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            {/* <AppShell.Header>
                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size="sm"
                />
                <Image src={'./log_white.png'}  height={40} width={40} fit="contain" p={'xs'}/>
            </AppShell.Header> */}


            <AppShell.Navbar p="md">
                <AppShell.Section>
                    {/* Toolbar moved here */}
                    <Group mt="md" justify="space-between">
                        <Group>
                            {currentPath !== baseDirectory && (
                                <Tooltip label={`Go back to ${parentDir.split('/').pop() ?? '/'}`}>
                                    <IconArrowBackUp
                                        onDoubleClick={handleGoUp}
                                        style={{ cursor: 'pointer' }}
                                        color="var(--mantine-color-blue-9)"
                                        size={20}
                                        stroke={2.5}
                                    />
                                </Tooltip>
                            )}
                        </Group>
                        {/* <Group>
                            <IconPlus onClick={() => tree.expandAllNodes()} style={{ cursor: 'pointer' }} />
                            <IconMinus onClick={() => tree.collapseAllNodes()} style={{ cursor: 'pointer' }} />
                        </Group> */}
                    </Group>
                </AppShell.Section>
                <AppShell.Section grow my="md" component={ScrollArea}>
                    {/* Pass props down to TreeView or similar */}

                    <FileExplorer1 currentPath={currentPath}
                        setCurrentPath={setCurrentPath}
                        tree={tree} selectedFilePath={selectedFilePath}
                        setSelectedFilePath={setSelectedFilePath} />
                </AppShell.Section>
                <AppShell.Section>
                    <Group justify='center' h="100%">
                        <ModeSwitcher />
                        <Tooltip label="Go to Home">
                            <ActionIcon
                                variant="subtle"
                                color="dark"
                                onClick={() => navigate('/')}
                            >
                                <IconHome size={20} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main>
                {selectedFilePath && (
                    <MonacoLogViewer filePath={selectedFilePath} onClose={() => setSelectedFilePath(null)} />
                )}

            </AppShell.Main>
        </AppShell>
    );
}

export default MainApp;