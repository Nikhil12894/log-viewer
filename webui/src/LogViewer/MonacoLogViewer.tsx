


import { ActionIcon, Group, Paper, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import Editor from '@monaco-editor/react';
import { IconDownload, IconX } from '@tabler/icons-react';
import { saveAs } from 'file-saver';
import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadFile, fetchLogChunk, getFileMetadata, type FileMetadata } from '../services/logViewerService';

const registerUniversalLogLanguage = (monaco: any) => {
    // Register universal log language
    monaco.languages.register({ id: 'universal-log' });

    monaco.languages.setMonarchTokensProvider('universal-log', {
        defaultToken: '',
        tokenizer: {
            root: [
                // Timestamps
                [/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d{1,6})?(?:Z|[+-]\d{2}:?\d{2})?)/, 'timestamp'],
                [/\b\d{10,13}\b/, 'timestamp'],

                // Log levels
                [/(?:\b|\B[\[\(])(ERROR|FATAL|CRIT|SEVERE|ERR)(?:\b|\B[\]\)])/i, 'error'],
                [/(?:\b|\B[\[\(])(WARN|WARNING|WRN)(?:\b|\B[\]\)])/i, 'warning'],
                [/(?:\b|\B[\[\(])(INFO|NOTICE|INF)(?:\b|\B[\]\)])/i, 'info'],
                [/(?:\b|\B[\[\(])(DEBUG|DBG)(?:\b|\B[\]\)])/i, 'debug'],
                [/(?:\b|\B[\[\(])(TRACE|TRC|VERBOSE|VERB)(?:\b|\B[\]\)])/i, 'trace'],

                // Identifiers
                [/\[([^\]]+)\]/, 'thread'],
                [/([a-zA-Z_$][a-zA-Z\d_$]*\.)+[a-zA-Z_$][a-zA-Z\d_$]*/, 'class'],
                [/\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/, 'http-method'],
                [/\b([1-5]\d{2})\b/, 'status-code'],
                [/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/, 'ip'],
                [/([a-fA-F0-9:]+:+)+[a-fA-F0-9]+/, 'ip'],
                [/https?:\/\/[^\s]+/, 'url'],
                [/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/, 'uuid'],
                [/\b0x[0-9a-fA-F]+\b/, 'hex'],
                [/\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, 'number'],
                [/(\/|\\|([a-zA-Z]:\\))?([^\/\\\s]+\/)*[^\/\\\s]+(:\d+)?/, 'filepath'],
                [/(\w+)=("[^"]*"|\S+)/, ['key', 'value']],
                [/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|INTO|VALUES|SET)\b/i, 'sql'],
                [/(\{.*\}|\[.*\])/, 'json'],
            ]
        }
    });

    // Dark theme
    monaco.editor.defineTheme('universal-log-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'timestamp', foreground: 'b5cea8', fontStyle: 'italic' },
            { token: 'error', foreground: 'ff6b6b', fontStyle: 'bold' },
            { token: 'warning', foreground: 'f9ca24' },
            { token: 'info', foreground: '22a6b3' },
            { token: 'debug', foreground: '7ed6df' },
            { token: 'trace', foreground: 'aaaaaa' },
            { token: 'thread', foreground: 'ce9178' },
            { token: 'class', foreground: '4ec9b0' },
            { token: 'http-method', foreground: '569cd6' },
            { token: 'status-code', foreground: 'd7ba7d' },
            { token: 'ip', foreground: 'ce9178' },
            { token: 'url', foreground: '569cd6', fontStyle: 'underline' },
            { token: 'uuid', foreground: 'd4d4d4' },
            { token: 'hex', foreground: 'b5cea8' },
            { token: 'number', foreground: 'b5cea8' },
            { token: 'filepath', foreground: 'd4d4d4' },
            { token: 'key', foreground: '9cdcfe' },
            { token: 'value', foreground: 'ce9178' },
            { token: 'sql', foreground: 'd7ba7d' },
            { token: 'json', foreground: 'd4d4d4' }
        ],
        colors: {
            'editor.background': '#1e1e1e',
            'editor.lineHighlightBackground': '#2a2a2a',
            'editorGutter.background': '#1e1e1e'
        }
    });

    // Light theme
    monaco.editor.defineTheme('universal-log-light', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'timestamp', foreground: '795e26', fontStyle: 'italic' },
            { token: 'error', foreground: 'e3116c', fontStyle: 'bold' },
            { token: 'warning', foreground: 'bf8803' },
            { token: 'info', foreground: '0070c1' },
            { token: 'debug', foreground: '098658' },
            { token: 'trace', foreground: '666666' },
            { token: 'thread', foreground: 'ab6526' },
            { token: 'class', foreground: '267f99' },
            { token: 'http-method', foreground: '0000ff' },
            { token: 'status-code', foreground: '795e26' },
            { token: 'ip', foreground: 'ab6526' },
            { token: 'url', foreground: '0000ff', fontStyle: 'underline' },
            { token: 'uuid', foreground: '666666' },
            { token: 'hex', foreground: '098658' },
            { token: 'number', foreground: '098658' },
            { token: 'filepath', foreground: '666666' },
            { token: 'key', foreground: '001080' },
            { token: 'value', foreground: 'ab6526' },
            { token: 'sql', foreground: '795e26' },
            { token: 'json', foreground: '666666' }
        ],
        colors: {
            'editor.background': '#ffffff',
            'editor.lineHighlightBackground': '#f5f5f5',
            'editorGutter.background': '#ffffff'
        }
    });
};


interface UniversalLogViewerProps {
    filePath: string;
    onClose?: () => void;
}

const UniversalLogViewer = ({ filePath, onClose }: UniversalLogViewerProps) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [metadata, setMetadata] = useState<FileMetadata | null>(null);
    const loadingRef = useRef(false);
    const editorRef = useRef<any>(null);
    const { colorScheme } = useMantineColorScheme();
    const [isEditorReady, setIsEditorReady] = useState(false);
    const monacoRef = useRef<any>(null);
    const nextOffsetRef = useRef(0);
    const scrollDebounceRef = useRef<number>(200);
    const currentFilePathRef = useRef(filePath);

    const fetchFileMetadata = useCallback(async (path: string) => {
        try {
            const res = await getFileMetadata(path);
            setMetadata(res);
        } catch (error) {
            console.error('Failed to fetch file metadata:', error);
        }
    }, []);

    const fetchLogs = useCallback(async (path: string, offsetToFetch: number) => {
        if (loadingRef.current || path !== currentFilePathRef.current) return;
        loadingRef.current = true;

        try {
            const res = await fetchLogChunk(path, offsetToFetch);

            if (path === currentFilePathRef.current) {
                setLogs(prev => offsetToFetch === 0 ? res.lines : [...prev, ...res.lines]);
                nextOffsetRef.current = res.nextOffset;
                setHasMore(res.hasMore);
            }
        } finally {
            loadingRef.current = false;
        }
    }, []);

    const handleDownload = useCallback(async () => {
        if (!metadata) return;
        
        try {
            const response = await downloadFile(metadata.path);
            
            const filename = metadata.path.split('/').pop() || 'logfile.log';
            saveAs(response, filename);
        } catch (error) {
            console.error('Download failed:', error);
        }
    }, [metadata]);

    const handleEditorMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        registerUniversalLogLanguage(monaco);
        setIsEditorReady(true);

        editor.onDidScrollChange((e: any) => {
            if (scrollDebounceRef.current) {
                clearTimeout(scrollDebounceRef.current);
            }

            const scrollTop = e.scrollTop;
            const scrollHeight = editor.getScrollHeight();
            const clientHeight = editor.getLayoutInfo().height;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

            if (isNearBottom && !loadingRef.current && hasMore) {
                scrollDebounceRef.current = window.setTimeout(() => {
                    if (editorRef.current?.getScrollTop() + editorRef.current?.getLayoutInfo().height >=
                        editorRef.current?.getScrollHeight() - 100) {
                        fetchLogs(currentFilePathRef.current, nextOffsetRef.current);
                    }
                }, 200);
            }
        });
    };

    useEffect(() => {
        if (isEditorReady && monacoRef.current) {
            const theme = colorScheme === 'dark' ? 'universal-log-dark' : 'universal-log-light';
            monacoRef.current.editor.setTheme(theme);
        }
    }, [colorScheme, isEditorReady]);

    useEffect(() => {
        currentFilePathRef.current = filePath;
        setLogs([]);
        setMetadata(null);
        nextOffsetRef.current = 0;
        setHasMore(true);
        fetchLogs(filePath, 0);
        fetchFileMetadata(filePath);
    }, [filePath, fetchLogs, fetchFileMetadata]);

    useEffect(() => {
        return () => {
            if (scrollDebounceRef.current) {
                clearTimeout(scrollDebounceRef.current);
            }
        };
    }, []);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
            {metadata && (
                <Paper p="sm" mb="xs" withBorder>
                    <Group justify="apart">
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <Text size="sm" truncate>
                                <strong>Path:</strong> {metadata.path}
                            </Text>
                            <Text size="sm">
                                <strong>Size:</strong> {formatFileSize(metadata.size)}
                                {metadata.lastModified && (
                                    <>
                                        {' | '}
                                        <strong>Modified:</strong> {new Date(metadata.lastModified).toLocaleString()}
                                    </>
                                )}
                            </Text>
                        </div>
                        <Group gap="xs">
                            <Tooltip label="Download file">
                            <ActionIcon
                                variant="filled"
                                color="blue"
                                title="Download file"
                                onClick={handleDownload}
                            >
                                <IconDownload size={16} />
                            </ActionIcon>
                            </Tooltip>
                            {onClose && (
                                <Tooltip label="Close file">
                                <ActionIcon
                                    variant="filled"
                                    color="red"
                                    title="Close file"
                                    onClick={onClose}
                                >
                                    <IconX size={16} />
                                </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                    </Group>
                </Paper>
            )}
            <div style={{ flex: 1, minHeight: 0 }}>
                <Editor
                    height="100%"
                    language="universal-log"
                    value={logs.join('\n')}
                    theme={colorScheme === 'dark' ? 'universal-log-dark' : 'universal-log-light'}
                    options={{
                        readOnly: true,
                        lineNumbers: 'on',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontSize: 13,
                        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                        wordWrap: 'on'
                    }}
                    onMount={handleEditorMount}
                    loading={<div>Loading logs...</div>}
                    beforeMount={(monaco) => {
                        registerUniversalLogLanguage(monaco);
                    }}
                />
            </div>
        </div>
    );
};

export default UniversalLogViewer;