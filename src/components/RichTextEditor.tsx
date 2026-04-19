import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, IconButton, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import ImageIcon from '@mui/icons-material/Image';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder = '写点什么...' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('请输入图片 URL');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    return (
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', gap: 0.5, p: 1, borderBottom: '1px solid #ccc', flexWrap: 'wrap' }}>
                <Tooltip title="加粗">
                    <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}>
                        <FormatBoldIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="斜体">
                    <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}>
                        <FormatItalicIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="无序列表">
                    <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'default'}>
                        <FormatListBulletedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="有序列表">
                    <IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive('orderedList') ? 'primary' : 'default'}>
                        <FormatListNumberedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="标题1">
                    <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}>
                        <LooksOneIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="标题2">
                    <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}>
                        <LooksTwoIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="插入图片">
                    <IconButton size="small" onClick={addImage}>
                        <ImageIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            <EditorContent editor={editor} style={{ minHeight: 300, padding: '12px' }} />
        </Box>
    );
};

export default RichTextEditor;