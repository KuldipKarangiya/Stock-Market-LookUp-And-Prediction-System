import React, { useState, useEffect } from 'react';
import { Link, useHistory } from "react-router-dom";
import * as api from '../../api/index.js';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Button, Grid, Typography, Container, TextField } from '@material-ui/core';
//import Datatable from '../Datatable/Datatable.js';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Box from '@material-ui/core/Box';
import CardHeader from '@material-ui/core/CardHeader';
import { useSelector } from 'react-redux';
import DeleteIcon from '@material-ui/icons/Delete';
import { Skeleton } from "@material-ui/lab";
import { AlpacaClient } from '@master-chief/alpaca'
const API_KEY = 'PK3FXI9WQ3EZ3F70F0C1';
const API_SECRET = 'oKItsTlpvrE75tNhQI1mqXulcpGj68FceNqwc435';
require("es6-promise").polyfill();
require("isomorphic-fetch");

var whynotcount = [];

const Home = () => {
    const [list, setList] = useState([])
    const [disable, setDisable] = useState(false)
    const [loading, setLoading] = useState(false)
    const stockdata = useSelector((state) => state.stock.stockData);
    const [q, setQ] = useState({ symbol: "A", name: "Agilent Technologies Inc" })
    let history = useHistory();
    var interval;
    const client = new AlpacaClient({
        credentials: {
            key: API_KEY,
            secret: API_SECRET,
            // access_token: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
            paper: true,
        },
        rate_limit: true,
    })
    console.log(client);
    async function getList() {
        try {
            const { data } = await api.getWatchlist();
            console.log(data);
            setList(data);
            whynotcount = data;
            // eslint-disable-next-line eqeqeq
            if (whynotcount.length == 5) {
                setDisable(true);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function updating(symbol) {
        try {
            // eslint-disable-next-line no-unused-vars
            const { data } = await api.updateWatchlist({ symbol });
            //console.log(data);
            //getList();
        } catch (error) {
            console.log(error);
        }
    }

    async function getPrice() {
        try {
            var pricess = [];
            for (var i in whynotcount) {
                var res = await client.getLastTrade({ symbol: whynotcount[i].symbol });
                pricess.push({ symbol: whynotcount[i].symbol, name: whynotcount[i].name, price: res.last.price, lastprice: whynotcount[i].lastprice });
            }
            console.log(pricess);
            setList(pricess);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (localStorage.getItem('profile')) {
            setLoading(false);
            getList().then(() => {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                interval = setInterval(() => {
                    getPrice();
                }, 3000);
                setLoading(true);
            }).catch(() => {
                console.log("sometimes it happens");
            });
            return () => { clearInterval(interval); };
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updating(q.symbol);
        await getList();
        // eslint-disable-next-line eqeqeq
        if (list.length == 4) {
            setDisable(true);
        }
    };

    const useStyles = makeStyles({
        root: {
            minWidth: 275,
            backgroundColor: "#f2f2f2"
        },
        bullet: {
            display: 'inline-block',
            margin: '0 2px',
            transform: 'scale(0.8)',
        },
        title: {
            fontSize: 14,
        },
        pos: {
            marginBottom: 8,
        },
        button: {
            marginRight: 3,
            align: `right`,
        },
        avatar: {
            backgroundColor: 'red',
        },
        gcontainer: {
            paddingLeft: "50px",
            paddingRight: "20px"
        }
    });

    const classes = useStyles();

    async function handleClick(symbol, e) {
        e.preventDefault();
        try {
            // eslint-disable-next-line no-unused-vars
            const { data } = await api.updateWatchlist({ symbol });
        } catch (error) {
            console.log(error);
        }
        await getList();
        // eslint-disable-next-line eqeqeq
        if (list.length == 5) {
            setDisable(false);
        }
    }

    const showTriggers = async (e) => {
        e.preventDefault();
        history.push(`/triggers`);
    }

    return (
        <div>
            {
                loading ?

                    <Container maxWidth="lg">
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={4} justify="center" alignItems="center">
                                <Grid item xs>
                                    <Autocomplete
                                        id="combo-box-demo"
                                        options={stockdata}
                                        getOptionLabel={(option) => option.symbol + " - " + option.name}
                                        getOptionSelected={(option, value) => option.symbol === value.symbol}
                                        style={{ width: 600 }}
                                        autoComplete
                                        value={q}
                                        onChange={(event, newValue) => {
                                            setQ(newValue);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="search stocks" variant="outlined" />}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <Box display="flex" justifyContent="space-between">
                                        <Button disabled={disable} variant="contained" type="submit" color="secondary" size="large" style={{ width: 260 }}>Add to Watchlist</Button>
                                        <Button variant="contained" onClick={showTriggers} color="secondary" size="large" style={{ width: 260 }}>Show all Triggers</Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                        <hr />
                        {list.map((row, index) =>
                            <Link to={{ pathname: `/view/${row.symbol}`, state: { symbol: row.symbol, name: row.name } }} key={index} style={{ textDecoration: 'none' }} >
                                <Box mb={1} key={index}>
                                    <Card className={classes.root} variant="outlined">
                                        <CardHeader
                                            avatar={
                                                <Typography>
                                                    {row.symbol}
                                                </Typography>
                                            }
                                            action={
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    className={classes.button}
                                                    startIcon={<DeleteIcon />}
                                                    onClick={(e) => handleClick(row.symbol, e)}
                                                >
                                                    Delete
                                </Button>
                                            }
                                        />
                                        <CardContent>
                                            <Grid container spacing={2} direction="row" justify="flex-start" alignItems="flex-start">
                                                <Grid item xs={12} sm={6} md={6} className={classes.gcontainer}>
                                                    <Typography variant="h6" component="h6">
                                                        {row.name}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6} className={classes.gcontainer}>
                                                    {row.price !== "" ?
                                                        <Typography variant="h6" component="h6">
                                                            {row.price}$ (({((row.price - row.lastprice) / 100).toFixed(4)})%)
                                                    </Typography>
                                                        : null}
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Link>
                        )}
                        <hr />
                    </Container>
                    :
                    <div>
                        <Skeleton height={200} />
                        <Skeleton height={200} />
                        <Skeleton height={200} />
                    </div>}
        </div>
    );
};

export default Home;
