import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import getUsersList from "../../redux/actions/users";
import Header from "../../components/Header";
import InformationBar from "../../components/InformationBar";
import { handleGetRequest } from "../../apis/apis.js";
import Spinner from "../../components/Spinner";
import Select from "../../components/Select";
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { filterGraphData } from "../../helpers/filterGraphData.js";
import { retrieveMonthNames } from "../../helpers/monthNames.js";
import NewResourceCard from "../../components/NewResourceCard";
import { getUserCategories } from "../../helpers/userCategories";
import "./AdminUserOverviewPage.css";
import { createUsersPieChartData } from "../../helpers/usersPieChartData";
import { createUserGraphData } from "../../helpers/usersGraphData";
import { ReactComponent as SearchButton } from "../../assets/images/search.svg";
import { ReactComponent as BackButton } from "../../assets/images/arrow-left.svg";
import UserListing from "../../components/UserListing";
import usePaginator from "../../hooks/usePaginator";
import AppFooter from "../../components/appFooter";

const AdminUserOverviewPage = () => {
  const [usersSummary, setUsersSummary] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("all");
  const [sectionValue, setSectionValue] = useState("all");
  const [word, setWord] = useState("");
  const [currentPage, handleChangePage] = usePaginator();
  const [dateRange, setDateRange] = useState("7");
  const dispatch = useDispatch();

  const COLORS = ["#0088FE", "#0DBC00", "#F9991A"];

  let graphDataArray = [];
  let filteredGraphData = [];

  const gettingUsers = useCallback(
    () => dispatch(getUsersList(dateRange, sectionValue, currentPage, word)),
    [currentPage, dispatch, sectionValue, word, dateRange]
  );

  useEffect(() => {
    getAllUsers();
    gettingUsers();
  }, [gettingUsers]);

  const getAllUsers = async () => {
    setLoading(true);

    try {
      const response = await handleGetRequest("/users");
      if (response.data.data.users.length > 0) {
        const totalNumberOfUsers = response.data.data.pagination.total;
        handleGetRequest(`/users?per_page=${totalNumberOfUsers}`)
          .then((response) => {
            if (response.data.data.users.length > 0) {
              setUsersSummary(response.data.data.users);
              setLoading(false);
            } else {
              throw new Error("No users found");
            }
          })
          .catch(() => {
            setFeedback("Failed to fetch all users, please try again");
          });
      } else {
        setFeedback("No users found");
      }
    } catch (error) {
      setFeedback("Failed to fetch users, please try again");
    }
  };

  const { isFetching, users, isFetched, pagination } = useSelector(
    (state) => state.usersListReducer
  );

  useEffect(() => {
    dispatch(getUsersList(dateRange, sectionValue, currentPage));
  }, [sectionValue, currentPage, dateRange, dispatch]);

  const userCounts = {
    total: usersSummary.length,
    verified: usersSummary.filter((user) => user.verified === true).length,
    unverified: usersSummary.filter((user) => user.verified === false).length,
    beta: usersSummary.filter((user) => user.is_beta_user === true).length,
    disabled: 0
  };

  const handleChange = ({ target }) => {
    setPeriod(target.getAttribute("value"));
  };

  // Filter out verified users
  const verifiedUsers = usersSummary.filter((user) => user.verified === true);

  // function call to create the user graph data
  graphDataArray = createUserGraphData(verifiedUsers);

  // calling the filterGraphData() to filter basing on period
  filteredGraphData = filterGraphData(graphDataArray, period);

  const availableUserCategories = getUserCategories();

  const handleSectionChange = (selectedOption) => {
    const selectedValue = selectedOption.value;
    setSectionValue(selectedValue);
  };

  const handleCallbackSearchword = ({ target: { value } }) => setWord(value);

  const handlePageChange = (currentPage) => {
    handleChangePage(currentPage);
    gettingUsers();
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };
  
  return (
    <div className="APage">
      <div className="TopRow">
        <Header />
        <InformationBar
          header={
            <span className="ProjectsInformationBarTitle">
              <Link className={`breadcrumb flex_back_link`} to={`/clusters`}>
                <BackButton />
                <div className="back_link">Users Overview</div>
              </Link>
            </span>
          }
        />
      </div>
      <div className="AMainSection">
        <div className="ContentSection">
          <div className="TitleArea">
            <div className="SectionTitle">Users Category Summary</div>
          </div>
          {loading && sectionValue !== "active" ? (
            <div className="ResourceSpinnerWrapper">
              <Spinner size="big" />
            </div>
          ) : feedback !== "" ? (
            <div className="NoResourcesMessage">{feedback}</div>
          ) : Object.keys(userCounts).length > 0 ? (
            <div className="ResourceClusterContainer">
              {Object.keys(userCounts).map((countType) => (
                <NewResourceCard
                  key={countType}
                  title={countType}
                  count={userCounts[countType]}
                />
              ))}
            </div>
          ) : null}

          <div className="TitleArea">
            <div className="SectionTitle">
              Graph and Pie Chart Summary on Users
            </div>
          </div>

          <div className="ChartContainer">
            <div className="VisualArea">
              <div className="VisualAreaHeader">
                <span className="SectionTitle">Platform Users</span>
                <span>
                  <div className="PeriodContainer">
                    <div className="PeriodButtonsSection">
                      <div
                        className={`${
                          period === "3" && "PeriodButtonActive"
                        } PeriodButton`}
                        name="3month"
                        value="3"
                        role="presentation"
                        onClick={handleChange}
                      >
                        3m
                      </div>
                      <div
                        className={`${
                          period === "4" && "PeriodButtonActive"
                        } PeriodButton`}
                        name="4months"
                        value="4"
                        role="presentation"
                        onClick={handleChange}
                      >
                        4m
                      </div>
                      <div
                        className={`${
                          period === "6" && "PeriodButtonActive"
                        } PeriodButton`}
                        name="6months"
                        value="6"
                        role="presentation"
                        onClick={handleChange}
                      >
                        6m
                      </div>
                      <div
                        className={`${
                          period === "8" && "PeriodButtonActive"
                        } PeriodButton`}
                        name="8months"
                        value="8"
                        role="presentation"
                        onClick={handleChange}
                      >
                        8m
                      </div>
                      <div
                        className={`${
                          period === "12" && "PeriodButtonActive"
                        } PeriodButton`}
                        name="1year"
                        value="12"
                        role="presentation"
                        onClick={handleChange}
                      >
                        1y
                      </div>
                      <div
                        className={`${
                          period === "all" && "PeriodButtonActive"
                        } PeriodButton`}
                        name="all"
                        value="all"
                        role="presentation"
                        onClick={handleChange}
                      >
                        all
                      </div>
                    </div>
                  </div>
                </span>
              </div>
              <AreaChart
                width={600}
                height={350}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
                syncId="anyId"
                data={period !== "all" ? filteredGraphData : graphDataArray}
              >
                <Line type="monotone" dataKey="Value" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="Month" />
                <XAxis
                  xAxisId={1}
                  dx={10}
                  label={{
                    value: "Months",
                    angle: 0,
                    position: "outside",
                  }}
                  height={70}
                  interval={12}
                  dataKey="Year"
                  tickLine={false}
                  tick={{ fontSize: 12, angle: 0 }}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <YAxis
                  label={{
                    value: "Number of Users",
                    angle: 270,
                    position: "outside",
                  }}
                  width={80}
                />
                <Area
                  type="monotone"
                  dataKey="Value"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
                <Tooltip
                  labelFormatter={(value) => {
                    const monthNames = retrieveMonthNames();
                    const month = parseInt(value) - 1;
                    return monthNames[month].name;
                  }}
                  formatter={(value) => {
                    if (value === 1) {
                      return [`${value} user`];
                    } else {
                      return [`${value} users`];
                    }
                  }}
                />
              </AreaChart>
            </div>

            <div className="VisualArea">
              <div className="VisualAreaHeader">
                <span className="SectionTitle">
                  Pie Chart for Users Categories
                </span>
              </div>
              <div className="PieContainer">
                <div className="ChartColumn">
                  <PieChart width={300} height={300}>
                    <Pie
                      data={createUsersPieChartData(userCounts)}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      paddingAngle={3}
                      label={true}
                    >
                      {createUsersPieChartData(userCounts).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>
                <div className="PercentageColumn">
                  <ul className="KeyItems">
                    {createUsersPieChartData(userCounts).map((entry, index) => (
                      <>
                        {" "}
                        <li key={`list-item-${index}`}>
                          <span
                            style={{ color: COLORS[index % COLORS.length] }}
                          >
                            {entry.category}:
                          </span>{" "}
                          {((entry.value / userCounts.total) * 100).toFixed(0)}%
                        </li>
                        <hr style={{ width: "100%" }} />
                      </>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="TitleArea">
            <div className="SectionTitle">
              <span>
                <Select
                  placeholder="Users Listing"
                  options={availableUserCategories}
                  onChange={(selectedOption) =>
                    handleSectionChange(selectedOption)
                  }
                />
              </span>
              <span>
                <div className="XSearchBar">
                  <div className="AdminSearchInput">
                    <input
                      type="text"
                      className="searchTerm"
                      name="Searchword"
                      placeholder="Search for account"
                      value={word}
                      onChange={(e) => {
                        handleCallbackSearchword(e);
                      }}
                    />
                    <SearchButton className="SearchIcon" />
                  </div>
                </div>
              </span>
            </div>
          </div>

          <UserListing
            sectionValue={sectionValue}
            setSelectedDateRange={handleDateRangeChange}
            isFetching={isFetching}
            isFetched={isFetched}
            users={users}
            pagination={pagination}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </div>
      </div>
      <hr />
      <AppFooter />
    </div>
  );
};

export default AdminUserOverviewPage;
