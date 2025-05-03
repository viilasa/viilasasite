'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import React from 'react'

// --- Interface Definitions (Ensure these match your Payload collection structure) ---

interface BaseNode {
  type: string
  [key: string]: any
}

interface TextNode extends BaseNode {
  type: 'text'
  text: string
  format?: number // Optional format property
}

interface MediaData {
  url: string // Stores path or filename from Payload
  alt?: string
  width?: number
  height?: number
  mimeType?: string // Useful for better differentiation
}

interface BlockNodeFields {
  blockType: string // Expect blockType to be within fields
  media?: MediaData
  caption?: string
  language?: string // For code block
  code?: string     // For code block
  content?: string  // For banner block etc.
  type?: 'info' | 'warning' | 'success' | 'error' // For banner block type
  // Add other fields specific to your custom blocks
}

interface BlockNode extends BaseNode {
  type: 'block'
  fields: BlockNodeFields // blockType is expected inside fields
  format?: number | string
  children?: LexicalNode[]
}

type HeadingNode = {
  type: 'heading'
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: LexicalNode[]
}

type ParagraphNode = {
  type: 'paragraph'
  children: LexicalNode[]
}

type ListNode = {
  type: 'list'
  listType: 'bullet' | 'number'
  children: LexicalNode[]
}

type ListItemNode = {
  type: 'listitem'
  children: LexicalNode[]
}

type LinkNode = {
  type: 'link'
  fields: {
    url: string
    linkType?: 'internal' | 'custom'
    newTab?: boolean
    doc?: {
      relationTo: string
      value: string | { slug?: string; id: string }
    }
  }
  children: LexicalNode[]
}


type LineBreakNode = {
  type: 'linebreak'
}

// Union type including all expected node types
type LexicalNode =
  | TextNode
  | BlockNode
  | HeadingNode
  | ParagraphNode
  | ListNode
  | ListItemNode
  | LinkNode
  | LineBreakNode

// --- Helper Function to determine media type ---

function getMediaType(url: string, mimeType?: string): 'image' | 'video' | 'unknown' {
  if (mimeType) {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
  }
  const extension = url?.split('.').pop()?.split('?')[0]?.toLowerCase();
  if (!extension) return 'unknown';

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'quicktime'];

  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';

  return 'unknown';
}

// --- RichTextRenderer Component ---

export const RichTextRenderer = ({ content }: { content: any }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!content) {
    return null;
  }

  const nodes = Array.isArray(content)
    ? content
    : content?.root?.children
    || (content?.children && Array.isArray(content.children))
    || [];

   if (!isMounted || !Array.isArray(nodes)) {
      return null;
   }

  return (
    <div className="rich-text prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-lg prose-video:rounded-lg prose-video:w-full prose-video:aspect-video">
      {nodes.map((node: LexicalNode, index: number) => (
         renderNode(node, `${node?.type || 'node'}-${index}`)
      ))}
    </div>
  );
}

// --- Node Rendering Functions ---

function renderNode(node: LexicalNode | any, key: string): React.ReactNode {
    if (!node || typeof node !== 'object' || !node.type) {
        return null;
    }

    switch (node.type) {
        case 'text': return renderText(node as TextNode, key);
        case 'heading': return renderHeading(node as HeadingNode, key);
        case 'paragraph': return renderParagraph(node as ParagraphNode, key);
        case 'list': return renderList(node as ListNode, key);
        case 'listitem': return renderListItem(node as ListItemNode, key);
        case 'link': return renderLink(node as LinkNode, key);
        case 'linebreak': return <hr key={key} className="my-4 border-t dark:border-gray-600" />;
        case 'block': return renderBlock(node as BlockNode, key);
        default:
            if (node.children && Array.isArray(node.children)) {
                return node.children.map((child: LexicalNode, i: number) => renderNode(child, `${key}-child-${i}`));
            }
            return null;
    }
}


function renderText(node: TextNode, key: string) {
  let content: React.ReactNode = node.text;
  const format = node.format || 0;

  if (typeof content !== 'string') {
    content = '';
  }

  if (format & 1) content = <strong>{content}</strong>;
  if (format & 2) content = <em>{content}</em>;
  if (format & 4) content = <u>{content}</u>;
  if (format & 8) content = <s>{content}</s>;
  if (format & 16) content = <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">{content}</code>;

  return <span key={key}>{content}</span>;
}

// --- renderBlock function (UPDATED with correct media URL logic) ---
function renderBlock(node: BlockNode, key: string) {

    const blockType = node.fields?.blockType;

    if (!blockType) {
        console.warn(`Block node is missing blockType in fields`, node);
        return <div key={key} className="border border-dashed p-2 my-4">Missing blockType in fields for this block.</div>;
    }

    switch (blockType) {
        case 'upload':
        case 'media':
        case 'mediaBlock':
            const mediaData = node.fields?.media;
            const caption = node.fields?.caption;

            if (!mediaData || !mediaData.url) {
                return <div key={key} className="border border-dashed p-2 my-4">Media block data is missing or incomplete.</div>;
            }

            // --- START: CORRECTED MEDIA URL CONSTRUCTION ---
            const filename = mediaData.url.split('/').pop();
            const correctBasePath = 'https://vilasacms.vercel.app/api/media/file/'; // Use the correct API endpoint base
            let mediaUrl = '';

            if (filename) {
                 mediaUrl = correctBasePath + filename;
                 // console.log("Constructed mediaUrl (using file endpoint):", mediaUrl); // Keep for debugging if needed
            } else {
                 console.error("Could not extract filename from mediaData.url:", mediaData.url);
                 mediaUrl = '#'; // Fallback
            }
            // --- END: CORRECTED MEDIA URL CONSTRUCTION ---

            if (!mediaUrl || mediaUrl === '#' || typeof mediaUrl !== 'string') {
                 console.error("Invalid mediaUrl constructed:", mediaUrl);
                 return <div key={key} className="border border-dashed p-2 my-4 text-red-500">Invalid media URL.</div>;
            }

            const mediaType = getMediaType(mediaUrl, mediaData.mimeType);

            return (
                <figure key={key} className="my-8">
                    {mediaType === 'image' && (
                        <div className="relative w-full" style={{ aspectRatio: mediaData.width && mediaData.height ? `${mediaData.width}/${mediaData.height}` : undefined }}>
                            <Image
                                src={mediaUrl} // Use the CORRECTED URL
                                alt={mediaData.alt || 'Uploaded media'}
                                fill={!(mediaData.width && mediaData.height)}
                                width={mediaData.width}
                                height={mediaData.height}
                                className="rounded-lg object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                                priority={false}
                            />
                        </div>
                    )}
                    {mediaType === 'video' && (
                        <video
                            controls
                            src={mediaUrl} // Use the CORRECTED URL
                            className="rounded-lg w-full aspect-video"
                            width={mediaData.width}
                            height={mediaData.height}
                            playsInline
                            preload="metadata"
                        >
                            Your browser does not support the video tag. Link: <a href={mediaUrl} target="_blank" rel="noopener noreferrer">{mediaUrl}</a>
                        </video>
                    )}
                    {mediaType === 'unknown' && (
                        <div className="border p-4 text-center text-gray-500 dark:text-gray-400">
                            Unsupported media type. Link: <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{mediaUrl}</a>
                        </div>
                    )}
                    {caption && (
                        <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                            {caption}
                        </figcaption>
                    )}
                </figure>
            );

        case 'code':
            if (!node.fields?.code) return null;
            return (
                <pre key={key} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6 text-sm font-mono">
                    <code className={`language-${node.fields?.language || 'plaintext'}`}>
                        {node.fields.code}
                    </code>
                </pre>
            );

        case 'banner':
             if (!node.fields?.content) return null;
             const bannerType = node.fields?.type || 'info';
             const bannerStyles = {
                 info: 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
                 warning: 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
                 success: 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
                 error: 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
             };
             return (
                 <div key={key} className={`${bannerStyles[bannerType] || bannerStyles.info} border-l-4 p-4 my-6 rounded`}>
                     {typeof node.fields.content === 'string' ? node.fields.content : 'Invalid banner content'}
                 </div>
             );

        // Add cases for YOUR other custom block slugs here

        default:
            console.warn(`Unsupported block type found in fields: "${blockType}"`, node);
            return <div key={key} className="border border-dashed p-2 my-4">Unsupported block type: {blockType}</div>;
    }
}


function renderHeading(node: HeadingNode, key: string) {
  const Tag = node.tag;
  if (!node.children || node.children.length === 0) return <Tag key={key}></Tag>;
  return (
    <Tag key={key} className={`${getHeadingStyle(node.tag)} my-4 scroll-mt-20`} id={`heading-${key}`}>
      {node.children.map((child, i) => renderNode(child, `${key}-child-${i}`))}
    </Tag>
  );
}

function renderParagraph(node: ParagraphNode, key: string) {
  if (!node.children || node.children.length === 0) return <p key={key}></p>;
  return (
    <p key={key} className="mb-4 leading-relaxed">
      {node.children.map((child, i) => renderNode(child, `${key}-child-${i}`))}
    </p>
  );
}

function renderList(node: ListNode, key: string) {
  const ListTag = node.listType === 'bullet' ? 'ul' : 'ol';
  if (!node.children || node.children.length === 0) return <ListTag key={key}></ListTag>;
  const listStyle = node.listType === 'bullet' ? 'list-disc' : 'list-decimal';
  return (
    <ListTag key={key} className={`${listStyle} pl-6 space-y-1 my-4 list-outside`}>
      {node.children.map((child, i) => renderNode(child, `${key}-child-${i}`))}
    </ListTag>
  );
}

function renderListItem(node: ListItemNode, key: string) {
  if (!node.children || node.children.length === 0) return <li key={key}></li>;
  return (
    <li key={key}>
      {node.children.map((child, i) => renderNode(child, `${key}-child-${i}`))}
    </li>
  );
}

function renderLink(node: LinkNode, key: string) {
  const linkFields = node.fields;
  if (!linkFields || !node.children || node.children.length === 0) {
      return <>{node.children?.map((child, i) => renderNode(child, `${key}-child-${i}`))}</>;
  }

  let href = linkFields.url || '#';
  const newTab = linkFields.newTab ?? false;

  if (linkFields.linkType === 'internal' && linkFields.doc?.value) {
      const doc = linkFields.doc;
      const relationTo = doc.relationTo;
      let slugOrId: string | undefined = undefined;

      if (typeof doc.value === 'string') {
          slugOrId = doc.value;
      } else if (typeof doc.value === 'object' && doc.value !== null) {
          slugOrId = doc.value.slug || doc.value.id;
      }

      if (relationTo && slugOrId) {
          // *** Adjust this path based on your specific routing ***
          href = `/${relationTo === 'pages' ? '' : relationTo + '/'}${slugOrId}`;
      } else {
          console.warn("Internal link data incomplete:", node);
          href = '#';
      }
  }

  const isValidUrl = href.startsWith('http') || href.startsWith('/') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:');
  if (!isValidUrl) {
       console.warn("Invalid href generated for link:", href, node);
  }

  return (
    <a
      key={key}
      href={href}
      target={newTab ? '_blank' : '_self'}
      rel={newTab ? 'noopener noreferrer' : undefined}
      className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
    >
      {node.children.map((child, i) => renderNode(child, `${key}-child-${i}`))}
    </a>
  );
}


// --- Utility Functions ---
function getHeadingStyle(tag: string): string {
  switch (tag) {
    case 'h1': return 'text-4xl lg:text-5xl font-extrabold';
    case 'h2': return 'text-3xl lg:text-4xl font-bold border-b pb-2 dark:border-gray-700';
    case 'h3': return 'text-2xl lg:text-3xl font-bold';
    case 'h4': return 'text-xl lg:text-2xl font-semibold';
    case 'h5': return 'text-lg lg:text-xl font-semibold';
    case 'h6': return 'text-base lg:text-lg font-semibold';
    default: return 'text-xl font-semibold';
  }
}