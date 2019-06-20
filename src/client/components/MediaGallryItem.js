import React, { useState } from 'react';
import PubSub from 'pubsub-js';
import axios from '../utils/axios';
import { pubSub as ps } from '../utils/const';

export default function MediaGalleryItem({ mediaId, columnWidth }) {
  const [isDeleting, setDeleting] = useState(false);

  const handleDeleteClick = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/videos/${mediaId}`);
    } catch (e) {
      // TODO display modal with error
      return;
    } finally {
      setDeleting(false);
    }
    PubSub.publish(ps.topics.MEDIA_LIST, ps.events.REFRESH);
  };

  const columnWidthClass = `is-${columnWidth}`;

  return (
    <div className={`column ${columnWidthClass}`}>
      <div className={`box ${isDeleting ? 'custom-loading' : ''}`}>
        <button type="button" className="delete" onClick={handleDeleteClick} />
        <a href={`/${mediaId}.mp4`}>
          <figure className="image is-1by1">
            <img src={`/${mediaId}.jpg`} alt={mediaId} />
          </figure>
        </a>
      </div>
    </div>
  );
}
