/* Example of React a react component I built on 07/16/2018 */

import React from 'react';
import PropTypes from 'prop-types';
import requests from 'Global/requests';
import config from '../../lib/config';

class VideoListItem extends React.PureComponent {
  static propTypes = {
    handleVideoSelect: PropTypes.func.isRequired,
    productId: PropTypes.number,
    title: PropTypes.string.isRequired,
    videoId: PropTypes.number.isRequired,
  }

  static defaultProps = {
    productId: null,
  }

  handleClick = (e) => {
    e.preventDefault();
    this.props.handleVideoSelect(this.props.videoId);
  }

  render() {
    return (
      <li>
        {this.props.productId && <img src={config.get('assets').premiumIcon} width="16px" alt="premium" />}
        <a href onClick={this.handleClick}>{this.props.title}</a>
      </li>
    );
  }
}

export default class VideoContainer extends React.PureComponent {
  state = {
    activeVideoId: null,
    videoOptions: [],
    isFetchingData: true,
  };

  componentDidMount() {
    const apiHost = 'https://api-p.rotogrinders.com';
    const apiPath = 'tags/grinders-live/videos';
    requests.get(`${apiHost}/${apiPath}?key=${config.get('apiPKey')}&limit=10`)
      .then((response) => {
        this.setState({
          videoOptions: response.body.data.results,
          isFetchingData: false,
        });
      });
  }

  handleToggleSize = (e) => {
    e.preventDefault();
    this.props.handleToggleSize();
  }

  handleToggleOpen = (e) => {
    e.preventDefault();
    this.props.handleToggleOpen();
  }

  handleVideoSelect = (videoId) => {
    this.setState({ activeVideoId: videoId });
  }

  resetVideo = () => {
    this.setState({ activeVideoId: null });
  }

  render() {
    if (this.state.isFetchingData) return <div>Loading...</div>;
    const activeVideo = this.state.videoOptions
      .find(option => option.id === this.state.activeVideoId);
    let videoUrl = '';
    if (activeVideo && activeVideo.youtube_video_id) videoUrl = `https://www.youtube.com/embed/${activeVideo.youtube_video_id}`;
    if (activeVideo && activeVideo.vimeo_video_id) videoUrl = `https://player.vimeo.com/video/${activeVideo.vimeo_video_id}`;

    return (
      <div className="sidebar-active sidebar-active--videos">
        <div className="sidebar-active__header">
          <span className="sidebar-active__title">
            {activeVideo ? activeVideo.title : 'Videos'}
          </span>
          <button onClick={this.handleToggleOpen}>
            <span className="icn icn-angle-down" />
          </button>
          {this.props.isOpen &&
            <button onClick={this.handleToggleSize}>
              {this.props.isExpanded
                ? <span className="icn icn-minus" />
                : <span className="icn icn-plus" />
              }
            </button>
          }
          <button onClick={this.resetVideo}>
            <span className="icn icn-menu2" />
          </button>
        </div>
        {this.props.isOpen &&
          <div className="sidebar-active__body sidebar-active_body--dark sidebar-active__body--no-padding">
            {activeVideo
              ? <iframe
                title={activeVideo.title}
                src={videoUrl}
                {...this.props.iframeProps}
              />
              : <ul className="lst">
                {this.state.videoOptions.map(option => (
                  <VideoListItem
                    key={option.id}
                    title={option.title}
                    productId={option.product_id}
                    handleVideoSelect={this.handleVideoSelect}
                    videoId={option.id}
                  />
                ))}
              </ul>
            }
          </div>
        }
      </div>
    );
  }
}

VideoContainer.propTypes = {
  responseKey: PropTypes.string.isRequired,
  iframeProps: PropTypes.shape({
    title: PropTypes.string,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  handleToggleSize: PropTypes.func.isRequired,
  handleToggleOpen: PropTypes.func.isRequired,
};
