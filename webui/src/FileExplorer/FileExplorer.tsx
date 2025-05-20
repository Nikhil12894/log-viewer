import {
    Group,
    Tree,
    useTree,
    type RenderTreeNodePayload,
    type TreeNodeData,
} from '@mantine/core';
import {
    CssIcon,
    NpmIcon,
    TypeScriptCircleIcon,
} from '@mantinex/dev-icons';
import {
    IconFolder,
    IconFolderOpen
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import classes from './FileExplorer.module.css';
import { fetchDirTree } from '../services/logViewerService';

interface FileIconProps {
    name: string;
    isFolder: boolean;
    expanded: boolean;
}

function FileIcon({ name, isFolder, expanded }: Readonly<FileIconProps>) {
    if (name.endsWith('package.json')) return <NpmIcon size={14} />;
    if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('tsconfig.json')) {
        return <TypeScriptCircleIcon size={14} />;
    }
    if (name.endsWith('.css')) return <CssIcon size={14} />;

    if (isFolder) {
        return expanded ? (
            <IconFolderOpen color="var(--mantine-color-yellow-9)" size={14} stroke={2.5} />
        ) : (
            <IconFolder color="var(--mantine-color-yellow-9)" size={14} stroke={2.5} />
        );
    }

    return null;
}

function Leaf({
    node,
    expanded,
    elementProps,
    tree,
    onFolderDoubleClick,
    currentPath,
    onFileClick,
}: RenderTreeNodePayload & {
    tree: ReturnType<typeof useTree>;
    onFolderDoubleClick: (value: string) => void;
    currentPath: string;
    onFileClick: (node: TreeNodeData) => void;

}) {
    const isRoot = node.value === currentPath;

    return (
        <Group
            gap={5}
            {...elementProps}
            onClick={(e) => {
                e.stopPropagation();
                if (!node.nodeProps?.isDir) {
                    onFileClick(node); // File click
                } else if (isRoot) {
                    tree.toggleExpanded(node.value); // Only root folder can toggle
                }
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (node.nodeProps?.isDir) {
                    onFolderDoubleClick(node.value); // triggers setCurrentPath
                }
            }}
        >
            <FileIcon name={node.value} isFolder={node.nodeProps?.isDir} expanded={expanded} />
            <span>{node.label}</span>
        </Group>
    );
}


function FileExplorer1({
    currentPath,
    setCurrentPath,
    setSelectedFilePath,
    tree,
}: Readonly<{
    currentPath: string;
    setCurrentPath: (path: string) => void;
    selectedFilePath: string | null;
    setSelectedFilePath: (path: string | null) => void;
    tree: ReturnType<typeof useTree>;
}>) {
    const [treeData, setTreeData] = useState<TreeNodeData[]>([]);


    function updateExpandedState(data: TreeNodeData[]) {
        setTreeData(data);
        tree.setExpandedState((prev) => {
            const newState = { ...prev };
            data.forEach((node) => {
                if (node.nodeProps?.isDir) {
                    newState[node.value] = true;
                }
            });
            return newState;
        });
    }

    const fetchTree = async (path: string) => {
        try {
            const data: TreeNodeData[] = await fetchDirTree(path);
            updateExpandedState(data);
        } catch (error) {
            console.error('Failed to fetch tree:', error);
        }
    };

    useEffect(() => {
        fetchTree(currentPath);
    }, [currentPath]);

    const handleFolderDoubleClick = (path: string) => {
        setCurrentPath(path);
    };
    const handleFileClick = (node: TreeNodeData) => {
        setSelectedFilePath(node.value);
    };

    return (
        <Tree
            classNames={classes}
            selectOnClick
            clearSelectionOnOutsideClick
            data={treeData}
            renderNode={(payload) => (
                <Leaf {...payload} tree={tree} onFolderDoubleClick={handleFolderDoubleClick} currentPath={currentPath} onFileClick={handleFileClick} />
            )}
            tree={tree}
        />
    );
}

export default FileExplorer1;
