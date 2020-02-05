# News / Release Notes

## 2.0.3
*05-Feb-2020*
* [Update initial default selected model to PCIC12](https://github.com/pacificclimate/climate-explorer-frontend/pull/323)
* [Migrate underscore to lowdash to support improving selectors](https://github.com/pacificclimate/climate-explorer-frontend/pull/317)
* [Switch help text generation to pcic-react-external-text package](https://github.com/pacificclimate/climate-explorer-frontend/pull/331)
* [Major overhaul of dataset selection UI](https://github.com/pacificclimate/climate-explorer-frontend/pull/333)
  * Fix a bug affecting variable selection for HadGEM datasets
  * Fix a bug affecting dataset selection for the Annual Cycle graph
  * Add category headers to variable selection dropdown
  * Remove deprecated mixins
  * more human-friendly menu options
  * improve handling of asynchronous events around dataset selection
* [Switch to a unicode arrow with better browser support](https://github.com/pacificclimate/climate-explorer-frontend/pull/345)
* [Configure Jenkins for this codebase](https://github.com/pacificclimate/climate-explorer-frontend/pull/346)
* configure Jenkins to [automatically push images to Dockerhub](https://github.com/pacificclimate/climate-explorer-frontend/pull/349) and [tag them with branch names](https://github.com/pacificclimate/climate-explorer-frontend/pull/351)

## 2.0.2
*15-Jul-2019*
* [Hotfix to remove lookbehind regex, which was not supported by Firefox](https://github.com/pacificclimate/climate-explorer-frontend/pull/315)

## 2.0.1
*10-Jul-2019*
* [Document export format for unstructured timeseries graphs](https://github.com/pacificclimate/climate-explorer-frontend/pull/310)
* [Order variable selection dropdown](https://github.com/pacificclimate/climate-explorer-frontend/pull/307)

## 2.0.0
*27-Jun-2019*

Major version increment: 
* Conversion to a Create React App app.
* Hot updatable configuration files (see README).
* Externalization of most text (Help, etc.) as a configuration file.

PRs:

* [Improve docker instructions in README](https://github.com/pacificclimate/climate-explorer-frontend/pull/288)
* [Add display options for prsn](https://github.com/pacificclimate/climate-explorer-frontend/pull/291)
* [Export data from unstructured timeseries graphs](https://github.com/pacificclimate/climate-explorer-frontend/pull/299)
* [**Convert to Create React App**](https://github.com/pacificclimate/climate-explorer-frontend/pull/298)
* [Convert Help and other text-intensive items to external text](https://github.com/pacificclimate/climate-explorer-frontend/pull/303)
* [Help > FAQ: Explain current polygon import limitations and behaviour](https://github.com/pacificclimate/climate-explorer-frontend/pull/306)

## 1.2.3
*12-Mar-2019*

* [More name tweaking](https://github.com/pacificclimate/climate-explorer-frontend/pull/286)

## 1.2.2
*12-Mar-2019*

* [Tweak naming and credits](https://github.com/pacificclimate/climate-explorer-frontend/pull/281)

## 1.2.1
*21-Feb-2019*

* [Fix a bug that caused the time of year on exported data to show as "undefined"](https://github.com/pacificclimate/climate-explorer-frontend/pull/268)
* [Support configuring user-friendly unit strings in UI](https://github.com/pacificclimate/climate-explorer-frontend/pull/270)
* [Graph popups display specific month or season corresponding to each value](https://github.com/pacificclimate/climate-explorer-frontend/pull/271)
* [Datasets with only annual values are visually separated on annual cycle comparison graphs](https://github.com/pacificclimate/climate-explorer-frontend/pull/273)

## 1.2.0
*17-Dec-2018*

Features and bug fixes

* [Flexible determination of "matching" climatologies (start and end dates)](https://github.com/pacificclimate/climate-explorer-frontend/pull/263)
* [Fix data export in LongTermAveragesGraph](https://github.com/pacificclimate/climate-explorer-frontend/pull/257)
* [Fix invalid default climatology (Dataset) selection](https://github.com/pacificclimate/climate-explorer-frontend/pull/255)
* [Save zipped shapefiles to root folder in zipfile](https://github.com/pacificclimate/climate-explorer-frontend/pull/251)
* [Fix stats summary table time of year bugs](https://github.com/pacificclimate/climate-explorer-frontend/pull/247)
* [Fix time of year selection in LTA graph](https://github.com/pacificclimate/climate-explorer-frontend/pull/245)
* [Allow users to change opacity on climate layers](https://github.com/pacificclimate/climate-explorer-frontend/pull/241)
* [Limit geometry to one active polygon](https://github.com/pacificclimate/climate-explorer-frontend/pull/240)
* [Fix imported polygon behaviours](https://github.com/pacificclimate/climate-explorer-frontend/pull/236)
* [Always display different variables with different vertical scales](https://github.com/pacificclimate/climate-explorer-frontend/pull/235)
* [Show dataset selection in Data Map panel label](https://github.com/pacificclimate/climate-explorer-frontend/pull/234)
* [Disable circle marker map tool](https://github.com/pacificclimate/climate-explorer-frontend/pull/233)
* [Set precision for *all* variables](https://github.com/pacificclimate/climate-explorer-frontend/pull/228)
* [Fix timestampToTimeOfYear bug; clean up code](https://github.com/pacificclimate/climate-explorer-frontend/pull/214)
* [Guidance, Part 6: Miscellaneous](https://github.com/pacificclimate/climate-explorer-frontend/pull/210)
* [Guidance, Part 5: Dataset context 
](https://github.com/pacificclimate/climate-explorer-frontend/pull/209)
* [Guidance, Part 4: Panels](https://github.com/pacificclimate/climate-explorer-frontend/pull/208)
* [Guidance, Part 3: Help](https://github.com/pacificclimate/climate-explorer-frontend/pull/205)
* [Guidance, Part 2: Information popovers](https://github.com/pacificclimate/climate-explorer-frontend/pull/200)
* [Guidance, Part 1: Revise navigation](https://github.com/pacificclimate/climate-explorer-frontend/pull/199)
* [Fix dataset filter for anomaly graph](https://github.com/pacificclimate/climate-explorer-frontend/pull/197)
* [Display datasets with no monthly values in the Long Term Averages graph](https://github.com/pacificclimate/climate-explorer-frontend/pull/194)
* [Improve anomaly graph UI](https://github.com/pacificclimate/climate-explorer-frontend/pull/180)
* [Flexible map width](https://github.com/pacificclimate/climate-explorer-frontend/pull/164)
* [Context graph bugfixes](https://github.com/pacificclimate/climate-explorer-frontend/pull/163)
* [UI changes and bugfixes to support multiplle timeset types in one portal](https://github.com/pacificclimate/climate-explorer-frontend/pull/156)
* [Fix spreadsheet download format](https://github.com/pacificclimate/climate-explorer-frontend/pull/153)
* [Make sure timeseries are correlated](https://github.com/pacificclimate/climate-explorer-frontend/pull/161)
* [Support selecting a specific variable+description](https://github.com/pacificclimate/climate-explorer-frontend/pull/160)
* [Default to loading CanESM2 and rcp85](https://github.com/pacificclimate/climate-explorer-frontend/pull/158)
* [Use correct scenario string for downscaled data queries to multistat](https://github.com/pacificclimate/climate-explorer-frontend/pull/151)
* [Add stick plot](https://github.com/pacificclimate/climate-explorer-frontend/pull/149)
* [Add a future annual cycle graph](https://github.com/pacificclimate/climate-explorer-frontend/pull/146)

Code improvements

* [Update LTAG and SST lifecycle to match AnnualCycleGraph](https://github.com/pacificclimate/climate-explorer-frontend/pull/262)
* [Fix test suite after jsdom update ](https://github.com/pacificclimate/climate-explorer-frontend/pull/178)
* [Pass only needed data to context graphs](https://github.com/pacificclimate/climate-explorer-frontend/pull/148)




## 1.1.0
*26-March-2018*
* [Adds Extreme Precipitation tab to list of existing data views](https://github.com/pacificclimate/climate-explorer-frontend/pull/141)
* [Add multi-model context graph (a.k.a. the "spaghetti plot) to main portal](https://github.com/pacificclimate/climate-explorer-frontend/pull/117)
* [Adds currently running version number and commitish to footer](https://github.com/pacificclimate/climate-explorer-frontend/pull/136)
* [Fix DualDataController query bugs](https://github.com/pacificclimate/climate-explorer-frontend/pull/120)
* [Several](https://github.com/pacificclimate/climate-explorer-frontend/pull/121) [refactoring](https://github.com/pacificclimate/climate-explorer-frontend/pull/113) [changes](https://github.com/pacificclimate/climate-explorer-frontend/pull/137) to improve code quality

## 1.0.2
*9-January-2018*
* [Disable parameters that don't match any datasets on dataset dropdown menus](https://github.com/pacificclimate/climate-explorer-frontend/pull/98)
* [Fix a bug that prevented comparing variables across a specified area](https://github.com/pacificclimate/climate-explorer-frontend/pull/109)
* [Fix map usability bugs](https://github.com/pacificclimate/climate-explorer-frontend/pull/100)
* [Add application-wide routing and access to multiple ensembles](https://github.com/pacificclimate/climate-explorer-frontend/pull/101)

## 1.0.1
*20-November-2017*

* [Fix a bug preventing downloading Annual Cycle data](https://github.com/pacificclimate/climate-explorer-frontend/pull/97)
* [Fix a bug that treated 0 as missing data](https://github.com/pacificclimate/climate-explorer-frontend/pull/94)

## 1.0.0

*10-November-2017*

* [Add a new unstructured timeseries graph for point-in-time (non-mean) data; allow displaying multiple time slices at once on the map](https://github.com/pacificclimate/climate-explorer-frontend/pull/89)
* [Use a thematic graph colour palette](https://github.com/pacificclimate/climate-explorer-frontend/pull/82)
* [Add a configuration file to provide precision, logarithmic scaling, and colour settings for specific variables](https://github.com/pacificclimate/climate-explorer-frontend/pull/67)
* [Add a new error message when a user selects a non-existent data set](https://github.com/pacificclimate/climate-explorer-frontend/pull/65)
* [Add abilty to display two datasets simultaneously on graphs and maps; support data sets split across multiple files by time resolution](https://github.com/pacificclimate/climate-explorer-frontend/pull/62)
* [Make data displayed in graphs downloadable](https://github.com/pacificclimate/climate-explorer-frontend/pull/57)
* [Switch to running tests serially to fix a race condition in Jest](https://github.com/pacificclimate/climate-explorer-frontend/pull/61)
* [Fix timeseries parsing for the MOTI portal](https://github.com/pacificclimate/climate-explorer-frontend/pull/55)
* [Add footer text to map](https://github.com/pacificclimate/climate-explorer-frontend/pull/49)
* [Switch request library to ajax from jQuery; improve error handling](https://github.com/pacificclimate/climate-explorer-frontend/pull/44)

## 0.2.0

*11-April-2016*

* [Add button to set ncWMS layer colorscalerange based on current map view](https://github.com/pacificclimate/climate-explorer-frontend/pull/39)
* [Add colorbar to map display](https://github.com/pacificclimate/climate-explorer-frontend/pull/38)
* [Add button to download map image](https://github.com/pacificclimate/climate-explorer-frontend/pull/29)
* [Enforce Airbnb eslint settings](https://github.com/pacificclimate/climate-explorer-frontend/pull/27)
* [Add loader to map when dataset not yet available](https://github.com/pacificclimate/climate-explorer-frontend/pull/26)
* [Consolidate MapController options](https://github.com/pacificclimate/climate-explorer-frontend/pull/20)
* [Add polygon import/export for map region](https://github.com/pacificclimate/climate-explorer-frontend/pull/17) with [shapefile](https://github.com/pacificclimate/climate-explorer-frontend/pull/24) capability
* [Add Datatable export buttons](https://github.com/pacificclimate/climate-explorer-frontend/pull/16)

## 0.1.0

*2-March-2016*

* Initial versioned release
