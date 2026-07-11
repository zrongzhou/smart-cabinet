'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link as LinkIcon,
  Image as ImageIcon, Undo, Redo, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Minus, SquareCode, Youtube as YoutubeIcon,
  Table as TableIcon, Palette, Highlighter, Plus, Trash2,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({ content, onChange, placeholder = '请输入内容...' }: TipTapEditorProps) {
  const lastContentRef = useRef<string>('');
  const colorInputRef = useRef<HTMLInputElement>(null);

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
      // 文本对齐（左/中/右/两端）
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // YouTube 嵌入
      Youtube.configure({
        width: 560,
        height: 315,
      }),
      // 表格
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      // 文字颜色 + 高亮（TextStyle 需放在 Color 之前）
      TextStyle,
      Color,
      Highlight,
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

  /**
   * 插入图片：优先让用户粘贴图片 URL（与前端博客详情页 prose-img 样式一致，所见即所得）；
   * 若用户取消或留空，则回退到本地文件选择（base64 兜底）。
   */
  const addImage = () => {
    const url = window.prompt('输入图片链接（http(s) 地址）；留空则选择本地文件：');
    if (url && /^https?:\/\//i.test(url.trim())) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
      return;
    }

    // 兜底：本地文件 -> base64
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

  /** 插入 YouTube 视频 */
  const addYoutube = () => {
    const url = window.prompt('请输入 YouTube 链接：');
    if (url && url.trim()) {
      editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
    }
  };

  /** 插入 3x3 带表头表格 */
  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
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

        {/* 文本对齐：左 / 中 / 右 / 两端 */}
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="左对齐">
          <AlignLeft className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="居中">
          <AlignCenter className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="右对齐">
          <AlignRight className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="两端对齐">
          <AlignJustify className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 分割线 / 代码块 */}
        <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="分割线">
          <Minus className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="代码块">
          <SquareCode className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 表格 */}
        <ToolButton onClick={addTable} title="插入表格">
          <TableIcon className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().addRowAfter().run()} title="新增行">
          <Plus className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="新增列">
          <Plus className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().deleteTable().run()} title="删除表格">
          <Trash2 className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 文字颜色 + 高亮 */}
        <ToolButton onClick={() => colorInputRef.current?.click()} title="文字颜色">
          <Palette className="w-4 h-4" />
        </ToolButton>
        <input
          ref={colorInputRef}
          type="color"
          className="hidden"
          onChange={(e) => {
            editor.chain().focus().setColor(e.target.value).run();
          }}
        />
        <ToolButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="高亮">
          <Highlighter className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolButton onClick={addYoutube} title="嵌入 YouTube">
          <YoutubeIcon className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={addLink} title="插入链接">
          <LinkIcon className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={addImage} title="插入图片（支持链接或本地文件）">
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

      {/* Editor Area —— 预览区 className 对齐前端博客详情页 prose 样式（去掉 dark:prose-invert，后台为浅色界面） */}
      <div className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-20 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:font-medium hover:prose-a:text-blue-700 prose-img:rounded-xl prose-img:my-8 prose-li:my-1 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-strong:text-gray-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
