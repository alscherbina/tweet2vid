import React, { useState } from 'react';
import PubSub from 'pubsub-js';
import axios from '../utils/axios';
import { pubSub as ps } from '../utils/const';

export default function TaskSubmission() {
  const [taskUrl, setTaskUrl] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const onTaskInputChange = e => {
    setTaskUrl(e.target.value);
  };

  const submitTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/videos/task', { twitterPostURL: taskUrl });
    } catch (e) {
      console.log(e);
    }
    setSubmitting(false);
    PubSub.publish(ps.topics.MEDIA_LIST, ps.events.REFRESH);
  };

  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="column is-half">
          <form onSubmit={submitTask}>
            <div className="field has-addons has-addons-centered">
              <div className="control is-expanded">
                <input
                  className="input is-fullwidth"
                  name="url"
                  type="text"
                  value={taskUrl}
                  onChange={onTaskInputChange}
                  placeholder="Tweet URL"
                />
              </div>
              <div className="control">
                <button
                  className="button is-info"
                  type="button"
                  value="Load"
                  onClick={submitTask}
                  disabled={isSubmitting}
                >
                  Load video
                </button>
              </div>
            </div>
            <input type="submit" className="is-invisible" />
          </form>
        </div>
      </div>
    </div>
  );
}
