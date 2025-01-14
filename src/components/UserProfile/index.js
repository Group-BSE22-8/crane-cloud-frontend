import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Avatar from "../Avatar";
import styles from "./UserProfile.module.css";
import { handleGetRequest } from "../../apis/apis.js";
import { API_BASE_URL } from "../../config";
import axios from "axios";
import Modal from "../../components/Modal";
import InformationBar from "../../components/InformationBar";
import Header from "../../components/Header";
import BlackInputText from "../BlackInputText";
import Spinner from "../../components/Spinner";
import PrimaryButton from "../PrimaryButton";
import getUserDetail from "../../redux/actions/userDetails";
import {
  updateProfile,
  clearUpdateProfileState,
} from "../../redux/actions/updateProfile";
import "../../index.css";
import { Link } from "react-router-dom";
import moment from "moment";
import AppFooter from "../appFooter";
import NewResourceCard from "../NewResourceCard";

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    const { name } = props.user;
    this.initialState = {
      username: name,
      showSaveModel: false,
      passwordModel: false,
      updateModal: false,
      passwordChangeLoading: false,
      passwordChangeError: "",
      passwordChangeSuccess: "",
      projectsCount: 0,
      activeProjectsCount: 0,
      disabledProjectsCount: 0,
    };
    this.state = this.initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSaving = this.handleChangeSaving.bind(this);
    this.getUserProjects = this.getUserProjects.bind(this);
    this.showPasswordWarningModel = this.showPasswordWarningModel.bind(this);
    this.hidePasswordWarningModel = this.hidePasswordWarningModel.bind(this);
    this.handlePasswordChanage = this.handlePasswordChanage.bind(this);
    this.showUpdateModal = this.showUpdateModal.bind(this);
    this.hideUpdateModal = this.hideUpdateModal.bind(this);
  }

  componentDidMount() {
    const { getUserDetail, data } = this.props;
    clearUpdateProfileState();
    getUserDetail(data.id);
    this.getUserProjects(data.id);
  }

  getUserProjects = async (userID) => {
    const response = await handleGetRequest(`/users/${userID}/projects`);

    if (response.data.data?.projects.length > 0) {
      const projectsList = response.data.data?.projects;

      let activeProjects = projectsList.filter(
        (project) => !project.name.includes("deleted")
      );
      let disabledProjects = activeProjects?.filter(
        (project) => project?.disabled === true
      );

      this.setState({
        projectsCount: activeProjects.length,
        activeProjectsCount: activeProjects.length - disabledProjects.length,
        disabledProjectsCount: disabledProjects.length,
      });
    } else {
      this.setState({
        projectsCount: 0,
        activeProjectsCount: 0,
        disabledProjectsCount: 0,
      });

      throw new Error("No projects found for user");
    }
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };
  showPasswordWarningModel = () => {
    this.setState({ passwordModel: true });
  };
  hidePasswordWarningModel = () => {
    this.setState({ passwordModel: false });
  };
  showUpdateModal() {
    this.setState({ updateModal: true });
  }
  hideUpdateModal() {
    this.setState({ updateModal: false });
  }

  componentDidUpdate(prevProps) {
    const { profileUpdated, user } = this.props;
    if (profileUpdated !== prevProps.profileUpdated) {
      //log user out
      localStorage.clear();
      window.location.href = "/";
    }
    if (user !== prevProps.user) {
      this.setState({ username: user.name });
    }
  }

  handleChangeSaving() {
    const { updateProfile, user } = this.props;
    const { username } = this.state;
    if (user.name !== username) {
      const update = {
        name: username,
      };
      updateProfile(user.id, update);
    }
  }
  handlePasswordChanage() {
    const { user } = this.props;
    const userResetEmail = { email: user.email };
    this.setState({
      passwordChangeLoading: true,
    });
    axios
      .post(`${API_BASE_URL}/users/forgot_password`, userResetEmail)
      .then((response) => {
        if (response.data.status === "success") {
          this.setState({
            loading: false,
            passwordChangeLoading: false,
            passwordChangeSuccess:
              "Please check your email. If you cant find the email, check the spam folder",
          });
          setTimeout(() => {
            this.hidePasswordWarningModel();
          }, 2000);
        }
      })
      .catch((err) => {
        this.setState({
          passwordChangeLoading: false,
          passwordChangeError: "Something went wrong",
        });
      });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { userId, username } = this.state;

    const postData = {
      username: username,
    };

    axios
      .post(`${API_BASE_URL}/users/${userId}`, postData)
      .then(() => {
        // this will logout the user
        localStorage.clear();
        window.location.href = "/";
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }

  render() {
    const {
      username,
      passwordModel,
      updateModal,
      passwordChangeError,
      passwordChangeSuccess,
      passwordChangeLoading,
      projectsCount,
      activeProjectsCount,
      disabledProjectsCount,
    } = this.state;
    const { user, isFetching, isFetched, profileUpdating } = this.props;

    return (
      <div className="MainPage">
        <div className="TopBarSection">
          <Header />
        </div>
        <div className="Mainsection">
          <div className="MainContentSection">
            <div className="InformationBarSection">
              <InformationBar
                header={
                  <span>
                    <Link className="breadcrumb" to={`/projects`}>
                      User Profile
                    </Link>
                    / {user?.name}
                  </span>
                }
                showBtn={false}
                showBackBtn
              />
            </div>

            <div className="ContentSection">
              <div>
                {isFetching ? (
                  <div className={styles.NoResourcesMessage}>
                    <div className={styles.SpinnerWrapper}>
                      <Spinner size="big" />
                    </div>
                  </div>
                ) : isFetched ? (
                  <div className="LeftAlignContainer">
                    <div className="ContentSection">
                      <div className="AdminUserPageContainer">
                        <section>
                          <div className="SectionTitle">
                            Personal information
                          </div>
                          <div className="AdminCardArea">
                            <div className="AdminUserProfileCard">
                              <div className="AdminUserProfileInfoSect">
                                <div className="AdminUserProfileInfoHeader">
                                  <Avatar
                                    name={user?.name}
                                    className={styles.UserAvatarLarge}
                                  />
                                  <div className={styles.Identity}>
                                    <div className={styles.IdentityName}>
                                      {user?.name}
                                      {user?.is_beta_user === true && (
                                        <div className={styles.BetaUserDiv}>
                                          Beta User
                                        </div>
                                      )}
                                    </div>
                                    <div className={styles.IdentityEmail}>
                                      {user?.email}
                                    </div>
                                  </div>
                                </div>

                                <div className="AdminProfileRowInfo">
                                  <div className="AdminProfileRowItem">
                                    Has
                                    <span>{activeProjectsCount} active</span>
                                    and
                                    <span>
                                      {disabledProjectsCount} disabled
                                    </span>
                                    projects
                                  </div>
                                  |
                                  <div className="AdminProfileRowItem">
                                    Organization:
                                    <span>
                                      {user?.organisation === null
                                        ? "Not Found"
                                        : user?.organisation}
                                    </span>
                                  </div>
                                  |
                                  <div className="AdminProfileRowItem">
                                    Date Joined:
                                    <span>
                                      {moment(user?.date_created)
                                        .utc()
                                        .format("ddd, MMMM DD, yyyy")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>

                        <div>
                          <div className="SectionTitle">
                            User Platform Metrics
                          </div>
                          <div className="Cluster1Container">
                            <NewResourceCard
                              key={1}
                              title="Projects"
                              count={projectsCount}
                            />
                            <NewResourceCard
                              key={1}
                              title="Apps Deployed"
                              count={user?.apps_count}
                            />
                            <NewResourceCard
                              key={1}
                              title="Databases Created"
                              count={user?.database_count}
                            />
                            <NewResourceCard
                              key={1}
                              title="Credits"
                              count={
                                user?.credits.length === 0
                                  ? 0
                                  : user?.credits[0].amount
                              }
                            />
                          </div>
                        </div>
                        <div className="AdminDBSections">
                          <div className="SectionTitle">Manage User</div>
                          <div className="ProjectInstructions">
                            <div className="MemberBody">
                              <div className="MemberTableRow">
                                <div className="SettingsSectionInfo">
                                  <div className="SubTitle">
                                    Change Password
                                    <br />
                                    <div className="SubTitleContent">
                                      This will permanently change your current
                                      password to a new one
                                    </div>
                                  </div>
                                  <div className="SectionButtons">
                                    <PrimaryButton
                                      onClick={() => {
                                        this.showPasswordWarningModel();
                                      }}
                                      color="red-outline"
                                    >
                                      Reset Password
                                    </PrimaryButton>
                                  </div>
                                </div>
                                <div className="SettingsSectionInfo1">
                                  <div className="SubTitle">
                                    Update Profile
                                    <br />
                                    <div className="SubTitleContent">
                                      This allows you to make changes to
                                      specific fields under your profile
                                    </div>
                                  </div>
                                  <div className="SectionButtons">
                                    <PrimaryButton
                                      onClick={() => {
                                        this.showUpdateModal();
                                      }}
                                      color="primary-outline"
                                    >
                                      Edit Profile
                                    </PrimaryButton>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {!isFetching && !isFetched && (
                            <div className="NoResourcesMessage">
                              <p>
                                Oops! Something went wrong! Failed to retrieve
                                User Profile.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {!isFetching && !isFetched && (
                  <div className={styles.NoResourcesMessage}>
                    Oops! Something went wrong! Failed to retrieve user.
                  </div>
                )}
              </div>
            </div>

            {updateModal && (
              <div className={styles.ProjectDeleteModel}>
                <Modal
                  showModal={updateModal}
                  onClickAway={this.hideUpdateAlert}
                >
                  <div>
                    <div
                      onSubmit={(e) => {
                        this.handleSubmit();
                      }}
                    >
                      <div className={styles.ModelContent}>
                        <div className={styles.ModelHeader}>
                          Edit User Details
                        </div>
                        <div className={styles.UpdateForm}>
                          <div className={styles.UpdateInputSection}>
                            <div className={styles.DeleteDescription}>
                              Username
                            </div>
                            <BlackInputText
                              placeholder="UserName"
                              name="username"
                              value={username}
                              onChange={(e) => {
                                this.handleChange(e);
                              }}
                            />
                          </div>

                          <div className={styles.UpdateProjectModelButtons}>
                            <PrimaryButton
                              onClick={() => {
                                this.handleChangeSaving();
                              }}
                              color="primary"
                            >
                              {profileUpdating ? <Spinner /> : "Update"}
                            </PrimaryButton>
                            <PrimaryButton
                              className="CancelBtn"
                              onClick={() => {
                                this.hideUpdateModal();
                              }}
                            >
                              Cancel
                            </PrimaryButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Modal>
              </div>
            )}

            {passwordModel === true && (
              <div className={styles.ProjectDeleteModel}>
                <Modal
                  showModal={passwordModel}
                  onClickAway={() => {
                    this.hidePasswordWarningModel();
                  }}
                >
                  <div className={styles.ModelContent}>
                    <div className={styles.ModelHeader}>Change Password</div>
                    <div className={styles.UpdateForm}>
                      <div className={styles.InformationText}>
                        Confirm and an email to edit your password will be sent
                        to you. Redo the process in case you don't recieve the
                        email
                      </div>
                      <div className={styles.UpdateProjectModelButtons}>
                        <PrimaryButton
                          onClick={() => {
                            this.handlePasswordChanage();
                          }}
                          color="primary"
                        >
                          {passwordChangeLoading ? <Spinner /> : "Confirm"}
                        </PrimaryButton>
                        <PrimaryButton
                          className="CancelBtn"
                          onClick={() => {
                            this.hidePasswordWarningModel();
                          }}
                        >
                          Cancel
                        </PrimaryButton>
                      </div>
                      <div>
                        {passwordChangeSuccess && (
                          <div className={styles.FeedBackDiv}>
                            {passwordChangeSuccess}
                          </div>
                        )}
                        {passwordChangeError && (
                          <div className={styles.ErrorDiv}>
                            {passwordChangeError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Modal>
              </div>
            )}
            <AppFooter />
          </div>
        </div>
      </div>
    );
  }
}

UserProfile.propTypes = {
  getUserDetail: PropTypes.func.isRequired,
  data: PropTypes.shape({
    id: PropTypes.string,
  }).isRequired,
  isFetched: PropTypes.bool,
  message: PropTypes.string,
  isFetching: PropTypes.bool,
  profileUpdated: PropTypes.bool,
  profileUpdating: PropTypes.bool,
  profileUpdateFailed: PropTypes.bool,
};

UserProfile.defaultProps = {
  user: {},
  message: "",
  isFetched: false,
  isFetching: false,
  profileUpdated: false,
  profileUpdating: false,
  profileUpdateFailed: false,
};

export const mapStateToProps = (state) => {
  const { data } = state.user;
  const { isFetching, user, isFetched, message } = state.userDetailReducer;
  const { profileUpdateFailed, profileUpdated, profileUpdating, errorMessage } =
    state.updateProfileReducer;
  return {
    isFetching,
    user,
    isFetched,
    message,
    data,
    profileUpdateFailed,
    profileUpdated,
    errorMessage,
    profileUpdating,
  };
};

const mapDispatchToProps = {
  getUserDetail,
  updateProfile,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
