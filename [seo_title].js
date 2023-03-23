import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { imageLoader } from '../../components/utils/imageLoader'
import { createMarkup } from '../../components/utils/markup'
import { supabase } from '../../components/utils/supabaseClient'
import { useRouter } from 'next/router'
import { WhatsappIcon, WhatsappShareButton } from 'next-share'
import Head from 'next/head'
import { getVehicleStatus } from '../../components/home/HomeBlogItems'
import VerifiedSvg from '../../components/svg/VerifiedSvg'
import { BLOG_CONSTANTS } from '../../components/utils/containts'

export const getStaticPaths = async () => {
    let { data, error } = await supabase
        .rpc('get_public_blogs', {
            'p_type': BLOG_CONSTANTS.BLOGS,
            'p_user_id': null,
        })
    if (error) console.error(error)
    else {
        const paths = data.map(blog => {
            return {
                params: {
                    seo_title:
                        blog.seo_title.toString()
                }
            }
        })
        return {
            paths,
            fallback: true
        }
    }
}

export const getStaticProps = async (context) => {
    const seo_title = context.params.seo_title
    console.log("context.params", context.params)
    let { data, error } = await supabase
        .rpc('get_public_blogs_by_title', {
            p_seo_title: seo_title
        })
    if (error) console.error(error)
    else {
        return {
            props: {
                blog: data[0],
            },
            revalidate: 10,
        }
    }
}

const BlogItems = ({ blog }) => {
    const selectedBlog = blog
    const router = useRouter()
    const [windowRef, setWindowRef] = useState(null)
    useEffect(() => {
        setWindowRef(window);
    }, [])

    if (router.isFallback) {
        return <div>Loading...</div>
    }
    
    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <title>{selectedBlog?.title}</title>
                <meta name="description" content={blog.title} />
                <meta name="theme-color" content="#000000" />
                <meta property="og:title" content={blog.title} />
                <meta property="og:url" content={windowRef?.location.href} />
                <meta property="og:description" content={blog.description} />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:type" content="website" />
                <meta name="og:image" content={`https://nqimfboargcbtsslzahc.supabase.co/storage/v1/object/public/blogs/${selectedBlog?.main_image}`} />
            </Head>
            <div className='font-body flex flex-col card bg-base-100 m-2  p-2 pt-4 overflow-y-auto mb-40'>
                <div>
                    <h3 className='font-semibold mb-3 text-2xl text-gray-500'>{selectedBlog?.title}</h3>
                    <div className="flex justify-between items-center">
                        <div className='flex space-x-3 my-6'>
                            <div className="avatar">
                                <div className="mask mask-squircle w-12 h-12">
                                    {selectedBlog?.avatar_url && <Image
                                        loader={imageLoader}
                                        src={selectedBlog?.avatar_url}
                                        alt={selectedBlog?.full_name}
                                        width={128}
                                        height={128}
                                    />}
                                </div>
                            </div>
                            <div>                              
                                <div>
                                    <div className="font-bold flex">
                                        <span className='mr-2 mb-1 text-xs'>{blog.full_name}</span>
                                        <span className={`${getVehicleStatus(blog.vehicle_is_verified)} h-3 mb-1`}>
                                            <VerifiedSvg />
                                        </span>
                                        <span className='ml-1 text-xs mb-1'>{blog.vehicle_is_verified === 'YES' ? 'Verified Owner' : 'Unverified'}</span>
                                    </div>
                                    <div className="text-xs opacity-50">{`${blog.brand_name} ${blog.model_name} ${blog.variant_name}`}</div>
                                </div>
                            </div>
                        </div>
                        <div className='-mt-3'>
                            <WhatsappShareButton
                                url={windowRef?.location.href}
                                title={selectedBlog?.title}
                                separator=":: "
                            >
                                <WhatsappIcon size={32} round />
                            </WhatsappShareButton>
                        </div>
                    </div>
                    <figure>
                        <img
                            src={`https://nqimfboargcbtsslzahc.supabase.co/storage/v1/object/public/blogs/${selectedBlog?.main_image}`}
                            alt={selectedBlog?.brand_name}
                            style={{ maxHeight: '250px', marginBottom: '20px' }}
                        />
                    </figure>
                    <div className='text-md text-gray-500'>
                        <div dangerouslySetInnerHTML={createMarkup(selectedBlog?.content)} />
                    </div>
                </div>
            </div>
        </>

    )
}

export default BlogItems
