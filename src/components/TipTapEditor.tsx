'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link as LinkIcon,
  Image as ImageIcon, Undo, Redo, List, ListOrdered, Quote,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({ content, onChange, placeholder = '请输入内容...' }: TipTapEditorProps) {
  const lastContentRef = useRef<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      // Set initial content when editor is created
      const initialContent = content || '<p></p>';
      editor.commands.setContent(initialContent, false);
      lastContentRef.current = initialContent;
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== undefined && content !== null) {
      const newContent = content || '<p></p>';
      
      // Compare with last content we set
      if (lastContentRef.current !== newContent) {
        editor.commands.setContent(newContent, false);
        lastContentRef.current = newContent;
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        editor.chain().focus().setImage({ src: ev.target?.result as string }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const addLink = () => {
    const url = window.prompt('请输入链接地址：');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const ToolButton = ({ onClick, active, disabled, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="加粗">
          <Bold className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体">
          <Italic className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="下划线">
          <UnderlineIcon className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="删除线">
          <Strikethrough className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="行内代码">
          <Code className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="标题1">
          <span className="text-sm font-bold">H1</span>
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="标题2">
          <span className="text-sm font-bold">H2</span>
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="标题3">
          <span className="text-sm font-bold">H3</span>
        </ToolButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="无序列表">
          <List className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="有序列表">
          <ListOrdered className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="引用">
          <Quote className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolButton onClick={addLink} title="插入链接">
          <LinkIcon className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={addImage} title="插入图片">
          <ImageIcon className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="撤销">
          <Undo className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="重做">
          <Redo className="w-4 h-4" />
        </ToolButton>
      </div>

      {/* Editor Area */}
      <div className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 prose prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
