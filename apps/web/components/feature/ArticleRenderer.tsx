import Link from 'next/link';
import {
  formatBRL,
  formatDuration,
  placeBySlug,
  type ArticleBlock,
  type ExpenseItem,
} from '@turistando/core';
import { Photo } from '../brand/Photo';
import { TransportBadge } from '../brand';

const EXPENSE_LABEL: Record<ExpenseItem['category'], string> = {
  entrada: 'Entrada',
  transporte: 'Transporte',
  alimentacao: 'Alimentação',
  estacionamento: 'Estacionamento',
  outros: 'Outros',
};

export function ArticleRenderer({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="article">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>;
    case 'heading':
      return block.level === 2 ? <h2>{block.text}</h2> : <h3>{block.text}</h3>;
    case 'image':
      return <Photo photo={block.photo} showCaption />;
    case 'gallery':
      return (
        <div className="gallery">
          {block.photos.map((p) => (
            <Photo key={p.id} photo={p} />
          ))}
        </div>
      );
    case 'quote':
      return (
        <blockquote className="quote">
          “{block.text}”
          {block.cite ? <footer className="coord" style={{ marginTop: '0.75rem' }}>— {block.cite}</footer> : null}
        </blockquote>
      );
    case 'tip':
      return <Callout variant="tip" title={block.title ?? 'Minha dica'} text={block.text} />;
    case 'info':
      return <Callout variant="info" title={block.title ?? 'Vale saber'} text={block.text} />;
    case 'warning':
      return <Callout variant="warning" title={block.title ?? 'Atenção'} text={block.text} />;
    case 'separator':
      return <hr className="divider" />;
    case 'transport':
      return (
        <div className="transport-block">
          <span className="u-label">Como cheguei</span>
          {block.legs.map((l, i) => (
            <TransportBadge key={i} mode={l.mode} detail={l.detail} />
          ))}
          {block.totalMinutes ? <span className="coord">{formatDuration(block.totalMinutes)}</span> : null}
        </div>
      );
    case 'costs': {
      const total = block.items.reduce((s, x) => s + x.amount, 0);
      return (
        <div>
          <span className="u-label" style={{ marginBottom: '0.6rem', display: 'inline-flex' }}>Quanto gastei</span>
          <div className="costs">
            {block.items.map((x, i) => (
              <div className="costs__row" key={i}>
                <span>{x.label} · {EXPENSE_LABEL[x.category]}</span>
                <span>{formatBRL(x.amount)}</span>
              </div>
            ))}
            <div className="costs__row costs__total">
              <span>Total</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>
        </div>
      );
    }
    case 'map':
      return (
        <div className="map-canvas" style={{ aspectRatio: '16 / 7', display: 'grid', placeItems: 'center' }}>
          <span className="coord">{block.label ?? 'Localização'} · {block.center.lat.toFixed(4)}, {block.center.lng.toFixed(4)}</span>
        </div>
      );
    case 'relatedPlaces':
      return (
        <div>
          <span className="u-label" style={{ marginBottom: '0.8rem', display: 'inline-flex' }}>Lugares perto daqui</span>
          <div className="grid grid-3">
            {block.placeSlugs.map((slug) => {
              const p = placeBySlug.get(slug);
              if (!p) return null;
              return (
                <Link key={slug} href={`/lugares/${p.slug}`} className="mini-card">
                  <div className="h3" style={{ fontSize: '1.05rem' }}>{p.name}</div>
                  <span className="coord">{p.shortDescription.slice(0, 60)}…</span>
                </Link>
              );
            })}
          </div>
        </div>
      );
    default:
      return null;
  }
}

function Callout({ variant, title, text }: { variant: 'tip' | 'info' | 'warning'; title: string; text: string }) {
  return (
    <div className={`callout callout--${variant}`}>
      <div className="callout__title">{title}</div>
      <p style={{ fontSize: '1.02rem' }}>{text}</p>
    </div>
  );
}
