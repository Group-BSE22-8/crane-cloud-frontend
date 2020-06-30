import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PrimaryButton from '../PrimaryButton';
import DotsImg from '../../assets/images/3dots.svg';
import deleteApp, { clearState } from '../../redux/actions/deleteApp';
import Spinner from '../Spinner';
import Modal from '../Modal';
import Status from '../Status';
import Feedback from '../Feedback';
import DeleteWarning from '../DeleteWarning';
import './AppsCard.css';

const AppsCard = (props) => {
  const [openDeleteAlert, setDeleteAlert] = useState(false);
  const [openDropDown, setDropDown] = useState(false);
  const dropdownRef = useRef(null);

  const {
    clearState, name, status, url, appId, isDeleted, isDeleting, isFailed, message, hasDeleted
  } = props;

  const toggleDropDown = () => {
    if (openDropDown) {
      setDropDown(false);
    } else {
      setDropDown(true);
    }
  };

  const handleDeleteApp = (appId) => {
    const {
      deleteApp
    } = props;

    deleteApp(appId);
  };


  const showDeleteAlert = () => {
    setDeleteAlert(true);
  };

  const hideDeleteAlert = () => {
    clearState();
    setDeleteAlert(false);
    if (isDeleted) {
      hasDeleted();
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropDown(false);
    }
  };

  // componentWillMount & componentWillUnmount
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    // returned function will be called on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => (
    hideDeleteAlert()
  ), [isDeleted]); // eslint-disable-line

  return (
    <div className="AppCard">
      <div className="AppCardHeader">
        <div className="AppNameSection">{name}</div>
        <div className="AppIconsSection">
          <div className="StatusData">
            <Status status={status} />
          </div>
          <div
            className="AppDropDown"
            onClick={toggleDropDown}
            role="presentation"
            ref={dropdownRef}
          >
            <img src={DotsImg} alt="three dots" className="DropDownImg" />
            {openDropDown && (
              <div className="AppDropDownContent">
                {/* <div>Update</div> */}
                <div
                  onClick={showDeleteAlert}
                  role="presentation"
                >
                  Delete
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="AppUrlText">Url :</div>
      <div className="AppUrl"><a target="_blank" rel="noopener noreferrer" href={url}>{url}</a></div>

      {
        (openDeleteAlert && (
          <div className="AppDeleteModel">
            <Modal showModal={openDeleteAlert}>
              <div className="DeleteAppModel">
                <div className="DeleteModalUpperSection">
                  <div className="DeleteDescription">
                    Are you sure you want to delete&nbsp;
                    <span>{name}</span>
                      &nbsp;
                    ?
                  </div>
                  <DeleteWarning />
                </div>

                <div className="DeleteModalLowerSection">
                  <div className="DeleteAppModelButtons">
                    <PrimaryButton label="cancel" className="CancelBtn" onClick={hideDeleteAlert} />
                    <PrimaryButton label={isDeleting ? <Spinner /> : 'Delete'} className="DeleteBtn" onClick={() => handleDeleteApp(appId)} />
                  </div>

                  {message && (
                    <Feedback
                      type={isFailed ? 'error' : 'success'}
                      message={message}
                    />
                  )}
                </div>
              </div>
            </Modal>
          </div>
        ))
      }
    </div>
  );
};

// inititate props
AppsCard.propTypes = {
  isDeleted: PropTypes.bool,
  isDeleting: PropTypes.bool,
  isFailed: PropTypes.bool,
  name: PropTypes.string.isRequired,
  status: PropTypes.bool.isRequired, // this is static
  url: PropTypes.string.isRequired,
  appId: PropTypes.string.isRequired,
  deleteApp: PropTypes.func.isRequired,
  hasDeleted: PropTypes.func.isRequired,
  clearState: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired
};

// assigning defaults
AppsCard.defaultProps = {
  isDeleted: false,
  isDeleting: false,
  isFailed: false
};


const mapStateToProps = (state) => {
  const {
    isDeleting, isDeleted, isFailed, message
  } = state.deleteAppReducer;
  return {
    isDeleting, isDeleted, isFailed, message
  };
};


const mapDispatchToProps = {
  deleteApp, clearState
};

export default connect(mapStateToProps, mapDispatchToProps)(AppsCard);
