import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import {
  IconBoldFill,
  IconBulletListFill,
  IconItalicFill,
  IconStrikeThroughFill,
  IconUnderlineFill,
} from '@intentui/icons'
import { IconListNumbers } from '@tabler/icons-react'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import type { Editor } from '@tiptap/react'
import { cn } from '@/lib/utils'

export const RichTextEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
      }),
      Underline, // Add underline extension
    ],
    immediatelyRender: false,
    content: `
        <p>Some <strong>bold</strong> and <em>italic</em> and <u>underlined</u> text.</p>
        <ul>
          <li>A bullet list item</li>
          <li>And another one</li>
        </ul>
        <ol>
          <li>A numbered list item</li>
          <li>And another one</li>
        </ol>
      `,
    editorProps: {
      attributes: {
        class: cn([
          'prose prose-sm max-w-none',
          'field-sizing-content min-h-40 w-full min-w-0 rounded-lg border border-input px-2.5 py-2 text-base placeholder-muted-fg shadow-xs outline-hidden transition duration-200 sm:text-sm/6',
          'focus:border-ring/70 focus:ring-3 focus:ring-ring/20',
          'disabled:opacity-50 disabled:forced-colors:border-[GrayText]',
          'hover:border-current/20 invalid:hover:border-danger/70',
        ]),
      },
    },
  })
  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  return (
    <div className="flex items-center px-0 py-1 mb-1 gap-x-1.5">
      <ToggleGroup
        size="sq-xs"
        selectionMode="multiple" // Enable multiple selections for formatting
      >
        <ToggleGroupItem
          id="bold"
          isSelected={editor.isActive('bold')}
          onPress={() => editor.chain().focus().toggleBold().run()}
        >
          <IconBoldFill />
        </ToggleGroupItem>
        <ToggleGroupItem
          id="italic"
          isSelected={editor.isActive('italic')}
          onPress={() => editor.chain().focus().toggleItalic().run()}
        >
          <IconItalicFill />
        </ToggleGroupItem>
        <ToggleGroupItem
          id="underline"
          isSelected={editor.isActive('underline')}
          onPress={() => editor.chain().focus().toggleUnderline().run()}
        >
          <IconUnderlineFill />
        </ToggleGroupItem>
        <ToggleGroupItem
          id="strike"
          isSelected={editor.isActive('strike')}
          onPress={() => editor.chain().focus().toggleStrike().run()}
        >
          <IconStrikeThroughFill />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup size="sq-xs">
        <ToggleGroupItem
          id="bullet-list"
          isSelected={editor.isActive('bulletList')}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
        >
          <IconBulletListFill />
        </ToggleGroupItem>
        <ToggleGroupItem
          id="ordered-list"
          isSelected={editor.isActive('orderedList')}
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <IconListNumbers data-slot="icon" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
